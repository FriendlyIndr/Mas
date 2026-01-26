import React, { useState } from 'react'
import { CheckCircle2 } from 'lucide-react';

const Task = ({ task }) => {

  return (
    <div className='relative group pr-8 flex items-center border-b border-b-gray-200 hover:border-b-2 hover:border-b-blue-600'>
        <div className='py-2.5 cursor-grab w-full'>
            <span className={`px-1.5 ${task?.done ? 'text-gray-400 line-through' : ''}`}>{task?.name}</span>
        </div>

        {/* Toggle */}
        <div className='absolute right-0 pr-[5px] pl-2 cursor-pointer'>
            <CheckCircle2 size={20} className={`opacity-0 group-hover:opacity-100 transition ${task?.done ? 'text-gray-400' : ''}`}/>
        </div>
    </div>
  )
}

export default Task