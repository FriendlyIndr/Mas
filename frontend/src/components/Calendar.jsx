import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, EllipsisVertical, User } from 'lucide-react';
import Day from './reusables/Day';

const Calendar = () => {
  const [days, setDays] = useState([
    {
      day: "Mon",
      date: "2026-10-03",
    },
    {
      day: "Tue",
      date: "2026-10-03",
    },
    {
      day: "Wed",
      date: "2026-10-03",
    },
    {
      day: "Thu",
      date: "2026-10-03",
    },
    {
      day: "Fri",
      date: "2026-10-03",
    },
    {
      day: "Sat",
      date: "2026-10-03",
    },
  ]);

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
          {days.map((dayObj, i) => {
            return (
              <Day 
                day={dayObj.day}
              />
            );
          })}
        </div>
      </div>
    </div>
  )
}

export default Calendar