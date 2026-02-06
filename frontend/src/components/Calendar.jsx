import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, DoorOpen, EllipsisVertical, User } from 'lucide-react';
import Day from './reusables/Day';
import { DndContext, closestCenter, DragOverlay, useSensors, useSensor, PointerSensor } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useNavigate } from 'react-router-dom';
import apiFetch from '../utils/apiFetch';
import TaskMenu from './reusables/TaskMenu';
import { useClickOutside } from '../hooks/useClickOutside';
import { API_BASE } from '../utils/api';

const Calendar = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(new Date());
  const [days, setDays] = useState({});
  const [tasks, setTasks] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [originDate, setOriginDate] = useState(null);
  const [beforeDragTasks, setBeforeDragTasks] = useState([]);

  const [userDetails, setUserDetails] = useState({
    userName: ''
  });
  const [profileMenu, setProfileMenu] = useState({
    visible: false,
    top: 0,
    left: 0,
  });

  const [dialogVisible, setDialogVisible] = useState(false);
  const [clickedTask, setClickedTask] = useState('');

  const navigate = useNavigate();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6, // pixels before drag starts
      }
    })
  );

  function applyDrag(prev, active, over) {
    const activeTask = prev.find(t => t.id === active.id);
    if (!activeTask || !over) return prev;

    const overType = over.data?.current?.type;

    // Dropped on a day
    if (overType === 'DAY') {
      const targetDate = over.data.current.date;

      const dayTasks = prev
        .filter(t =>
          new Date(t.date).toDateString() === targetDate.toDateString()
        );

      return prev.map(t =>
        t.id === active.id
          ? { ...t, date: targetDate, order: dayTasks.length }
          : t
      );
    }

    // Dropped on another task
    const overTask = prev.find(t => t.id === over.id);
    if (!overTask) return prev;

    const targetDate = overTask.date;

    let updated = prev.map(t =>
      t.id === active.id ? { ...t, date: targetDate } : t
    );

    const dayTasks = updated
      .filter(t =>
        new Date(t.date).toDateString() ===
        new Date(targetDate).toDateString()
      )
      .sort((a, b) => a.order - b.order);

    const oldIndex = dayTasks.findIndex(t => t.id === active.id);
    const newIndex = dayTasks.findIndex(t => t.id === over.id);

    const reordered = arrayMove(dayTasks, oldIndex, newIndex);

    return updated.map(t => {
      const idx = reordered.findIndex(x => x.id === t.id);
      return idx !== -1 ? { ...t, order: idx } : t;
    });
  }

  function getAfterDragChangedTasks(before, after) {
    return after.filter(afterTask => {
      const beforeTask = beforeDragTasks.find(b => b.id === afterTask.id);
      if (!beforeTask) return false;
      
      return (
        beforeTask.date !== afterTask.date ||
        beforeTask.order !== afterTask.order
      );
    });
  }

  async function syncTasksToBackend(changedTasks) {
    try {
      const response = await fetch(`${API_BASE}/tasks/move`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: changedTasks.map(t => ({
            id: t.id,
            date: t.date,
            order: t.order,
          })),
        }),
      });
    } catch (err) {
      console.error('Error while syncing tasks with backend:', err);
    }
  }

  function handleDragEnd(e) {
    const { active, over } = e;

    // Dropped nowhere meaningful -> revert
    if (!over) {
      setTasks(prev =>
        prev.map(t =>
          t.id === activeTask.id
            ? { ...t, date: originDate }
            : t
        )
      );
      return;
    }

    setTasks(prev => {
      const newTasks = applyDrag(prev, active, over);

      const changedTasks = getAfterDragChangedTasks(beforeDragTasks, newTasks);

      if (changedTasks.length > 0) {
        syncTasksToBackend(changedTasks);
      }

      return newTasks;
    });
  }

  const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();

    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);

    return d;
  }

  function calculateWeek(date) {
    const monday = getMonday(date);

    const week = {};

    // Calculate week
    WEEK_DAYS.forEach((day, i) => {
      const date = new Date(monday);
      date.setDate(date.getDate() + i);
      week[day] = date;
    });

    setDays(week);
  }

  useEffect(() => {
    calculateWeek(activeDay);
  }, [activeDay]);

  async function fetchTasks() {
    try {
      // Calculate dates
      const dates = Object.keys(days).sort(
        (a, b) => a - b
      );

      const startDate = dates[0];
      const endDate = dates[dates.length - 1];

      // Fetch tasks
      const response = await apiFetch(`${API_BASE}/tasks?startDate=${days[startDate]}&endDate=${days[endDate]}`, {
        headers: {
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { tasks } = await response.json();

      setTasks(tasks);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (Object.keys(days).length === 0) {
      return;
    }

    fetchTasks();
  }, [days]);

  function moveWeek(dir) {
    setActiveDay(prev => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + dir * 7);
      return next;
    });
  }

  async function fetchUser() {
    try {
      const response = await apiFetch(`${API_BASE}/auth/me`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json();

      setUserDetails(prev => ({
        userName: responseData.userName,
      }));
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  const profileRef = useRef(null);
  const profileMenuRef = useRef(null);

  function handleProfileButtonClick() {
    if (userDetails.userName) {
      // Find position of profile button
      const { offsetHeight, offsetLeft } = profileRef.current;

      // Set menu visibility and positiion
      setProfileMenu(prev => ({
        visible: !prev.visible,
        top: offsetHeight,
        left: offsetLeft,
      }));
    } else {
      navigate('/auth');
    }
  }

  const closeProfileMenu = useCallback(() => {
    setProfileMenu(prev => ({ ...prev, visible: false }));
  }, []);

  useClickOutside(profileMenuRef, closeProfileMenu, profileMenu.visible);

  async function handleLogOut() {
    try {
      const response = await fetch(`${API_BASE}/auth/logout`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: {}
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (err) {
      console.error('Error logging out:', err);
    } finally {
      setUserDetails(prev => ({
        userName: ''
      }));
    }
  }

  function handleTaskClick(task) {
    setClickedTask(task);
    setDialogVisible(true);
  }

  const dialogRef = useRef(null);

  useClickOutside(dialogRef, setDialogVisible, dialogVisible);

  if (isLoading) {
    return (
      <p>Loading...</p>
    );
  }

  return (
    <>
      <>
        <div className='App'>
          <div className='flex items-center justify-between px-6 py-4 md:py-0 md:px-0 md:pt-0 md:mb-[72px]'>
            <h1 className='hidden md:inline text-4xl font-bold'>
              {getMonday(activeDay).toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
            </h1>

            <h1 className='md:hidden text-xl font-bold'>
              {getMonday(activeDay).toLocaleString('en-IN', { month: 'short', year: 'numeric' })}
            </h1>

            <div className='flex'>
              <div 
                ref={profileRef}
                className='tooltip_container profile'
                onClick={() => handleProfileButtonClick()}
              >
                {userDetails.userName ? userDetails.userName[0].toUpperCase() : <User className=''/>}
                <span className='tooltip_title'>{userDetails.userName ? 'Profile' : 'Log in'}</span>
              </div>

              <div className='dots'>
                <EllipsisVertical className=''/>
              </div>

              <div className='arrow_left bg-black text-white p-2 rounded-full cursor-pointer' onClick={() => moveWeek(-1)}>
                <ChevronLeft className=''/>
              </div>

              <div className='arrow_right bg-black text-white p-2 rounded-full cursor-pointer ml-3' onClick={() => moveWeek(1)}>
                <ChevronRight className=''/>
              </div>
            </div>
          </div>

          <div>
            <div className='weekly_tasks_view grid grid-cols-1 md:grid-cols-6 px-6 pt-6 md:px-0 md:pt-0'>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={({ active }) => {
                  setBeforeDragTasks(tasks);
                  const task = tasks.find(t => t.id === active.id);
                  setActiveTask(task);
                  setOriginDate(task?.date);
                }}
                onDragEnd={(e) => {
                  handleDragEnd(e);
                  setActiveTask(null);
                  setOriginDate(null);
                }}
                onDragCancel={() => {
                  setActiveTask(null);
                  setOriginDate(null);
                }}
              >
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => {
                  const date = days[day];

                  const isToday = new Date(days[day]).toDateString() === new Date().toDateString();
                  
                  return (
                    <Day 
                      day={day}
                      date={date}
                      isToday={isToday}
                      tasks={tasks}
                      setTasks={setTasks}
                      handleTaskClick={handleTaskClick}
                      key={i}
                    />
                  );
                })}

                <div className='md:space-y-12 weekly_tasks_view'>
                  {['Sat', 'Sun'].map((day, i) => {
                    const date = days[day];

                    const isToday = new Date(days[day]).toDateString() === new Date().toDateString();

                    return (
                      <Day 
                        day={day}
                        date={date}
                        isToday={isToday}
                        tasks={tasks}
                        setTasks={setTasks}
                        handleTaskClick={handleTaskClick}
                        key={i}
                      />
                    );
                  })}
                </div>

                <DragOverlay>
                  {activeTask ? (
                    <div className='px-3 py-2 bg-white shadow rounded border'>
                      {activeTask.name}
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            </div>
          </div>
        </div>

        {profileMenu.visible && userDetails.userName && (
          <div 
            className='profile_menu'
            style={{ 
              top: profileMenu.top + 35, 
              left: profileMenu.left - 100
            }}
            ref={profileMenuRef}
          >
            <div className='profile_menu_header'>
              <div className='profile_menu_avatar'>
                {userDetails.userName[0].toUpperCase()}
              </div>

              <div className='profile_menu_heading'>
                {userDetails.userName}
              </div>
            </div>

            <div className='profile_menu_footer'>
              <span 
                className='profile_menu_footer_link'
                onClick={() => handleLogOut()}
              >
                <DoorOpen size={15} className='mr-1.5'/>
                Log out
              </span>
            </div>
          </div>
        )}
      </>

      {dialogVisible && (
        <div 
          className='dialog_overlay' 
          style={{ inset: 0 }}
        >
          <TaskMenu 
            dialogRef={dialogRef}
            clickedTask={clickedTask}
            setClickedTask={setClickedTask}
            setDialogVisible={setDialogVisible}
            setTasks={setTasks}
          />
        </div>
      )}
    </>
  )
}

export default Calendar