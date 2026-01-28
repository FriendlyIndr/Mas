import React, { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, EllipsisVertical, User } from 'lucide-react';
import Day from './reusables/Day';
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

const Calendar = () => {
  const [days, setDays] = useState({
      Mon: new Date("2026-10-03"),
      Tue: new Date("2026-10-03"),
      Wed: new Date("2026-10-03"),
      Thu: new Date("2026-10-03"),
      Fri: new Date("2026-10-03"),
      Sat: new Date("2026-10-03"),
      Sun: new Date("2026-10-03"),
  });
  const [tasks, setTasks] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [originDate, setOriginDate] = useState(null);

  useEffect(() => {
    // Fetch tasks
  }, []);

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
      const activeTask = prev.find(t => t.id === active.id);
      if (!activeTask) return prev;

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

  useEffect(() => {
    // Set days
    const today = new Date();
    const monday = getMonday(today);

    const week = {};

    // Calculate week
    WEEK_DAYS.forEach((day, i) => {
      const date = new Date(monday);
      date.setDate(date.getDate() + i);
      week[day] = date;
    });

    setDays(week);
  }, []);

  return (
    <div className='px-6 pt-6 pb-12'>
      <div className='flex justify-between mb-[72px]'>
        <h1 className='text-4xl font-bold'>January 2026</h1>

        <div className='flex'>
          <div className='bg-blue-100 p-2 rounded-full cursor-pointer mr-3'>
            <User className=''/>
          </div>

          <div className='bg-violet-300 p-2 rounded-full cursor-pointer mr-6'>
            <EllipsisVertical className=''/>
          </div>

          <div className='bg-black text-white p-2 rounded-full cursor-pointer'>
            <ChevronLeft className=''/>
          </div>

          <div className='bg-black text-white p-2 rounded-full cursor-pointer ml-3'>
            <ChevronRight className=''/>
          </div>
        </div>
      </div>

      <div>
        <div className='grid grid-cols-6'>
          <DndContext
            collisionDetection={closestCenter}
            onDragStart={({ active }) => {
              const task = tasks.find(t => t.id === active.id)
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