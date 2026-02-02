import React, { useState } from 'react'
import { CheckCircle2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const Task = ({ task, checkTask, handleTaskClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      className='relative group pr-8 flex items-center border-b border-b-gray-200 hover:border-b-2 hover:border-b-blue-600'
    >
        <div 
          className='py-2.5 cursor-grab active:cursor-grabbing w-full'
          {...listeners}
          onClick={() => handleTaskClick(task)}
        >
            <span 
              className={`px-1.5 ${
                task?.done ? 'text-gray-400 line-through' : ''
              }`}
            >
              {task?.name}
            </span>
        </div>

        {/* Toggle */}
        <div 
          className={`toggle_container ${task?.done ? 'text-gray-400' : ''}`}
          onClick={() => checkTask(task)}
        >
            <CheckCircle2 size={20}/>
        </div>
    </div>
  )
}

export default Task