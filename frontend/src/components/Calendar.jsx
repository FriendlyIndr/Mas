import React, { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, EllipsisVertical, User } from 'lucide-react';
import Day from './reusables/Day';
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

const Calendar = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(new Date());
  const [days, setDays] = useState({});
  const [tasks, setTasks] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [originDate, setOriginDate] = useState(null);
  const [beforeDragTasks, setBeforeDragTasks] = useState([]);

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
      const response = await fetch('http://localhost:3000/tasks/move', {
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
      const response = await fetch(`http://localhost:3000/tasks?startDate=${days[startDate]}&endDate=${days[endDate]}`, {
        credentials: 'include',
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

  if (isLoading) {
    return (
      <p>Loading...</p>
    );
  }

  return (
    <div className='px-6 pt-6 pb-12'>
      <div className='flex justify-between mb-[72px]'>
        <h1 className='text-4xl font-bold'>
          {getMonday(activeDay).toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
        </h1>

        <div className='flex'>
          <div className='bg-blue-100 p-2 rounded-full cursor-pointer mr-3'>
            <User className=''/>
          </div>

          <div className='bg-violet-300 p-2 rounded-full cursor-pointer mr-6'>
            <EllipsisVertical className=''/>
          </div>

          <div className='bg-black text-white p-2 rounded-full cursor-pointer'>
            <ChevronLeft onClick={() => moveWeek(-1)} className=''/>
          </div>

          <div className='bg-black text-white p-2 rounded-full cursor-pointer ml-3'>
            <ChevronRight onClick={() => moveWeek(1)} className=''/>
          </div>
        </div>
      </div>

      <div>
        <div className='grid grid-cols-6'>
          <DndContext
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
                  key={i}
                />
              );
            })}

            <div className='space-y-12'>
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
  )
}

export default Calendar