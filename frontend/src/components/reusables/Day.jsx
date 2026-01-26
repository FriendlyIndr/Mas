import { CheckCircle2 } from 'lucide-react'
import React, { useState } from 'react'
import Task from './Task'
import AddTask from './AddTask'

const Day = ({ day, date, isToday }) => {
    const [tasksList, setTasksList] = useState([]);
    
  return (
    <div className='px-3'>
        {/* Header */}
        <div className='flex justify-between pb-3'>
            <h2 className={`font-bold text-xl ${isToday ? 'text-blue-600' : ''}`}>
                {date}
            </h2>

            <h2 className={`font-semibold text-xl ${isToday ? 'text-blue-300' : 'text-gray-300'}`}>
                {day}
            </h2>
        </div>

        {/* Tasks */}
        <div className={`border-t-2 ${isToday ? 'border-t-blue-600' : ''}`}>
            <Task />
            <AddTask />
        </div>
    </div>
  )
}

export default Day