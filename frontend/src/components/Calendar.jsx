import React, { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, EllipsisVertical, User } from 'lucide-react';
import Day from './reusables/Day';
import { DndContext, closestCenter } from '@dnd-kit/core';
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

  useEffect(() => {
    setTasks([
      {
          name: 'Task 1',
          done: false,
          id: crypto.randomUUID(),
          date: new Date(),
          order: 0,
      },
      {
          name: 'Task 2',
          done: true,
          id: crypto.randomUUID(),
          date: new Date(),
          order: 1,
      },
    ]);
  }, []);

  function handleDragEnd(e) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    setTasks(tasks => {
      const oldIndex = tasks.findIndex(t => t.id === active.id);
      const newIndex = tasks.findIndex(t => t.id === over.id);
      return arrayMove(tasks, oldIndex, newIndex);
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
            onDragEnd={handleDragEnd}
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
          </DndContext>
        </div>
      </div>
    </div>
  )
}

export default Calendar