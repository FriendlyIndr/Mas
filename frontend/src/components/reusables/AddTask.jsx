import React, { useState } from 'react'

const AddTask = ({ addTask, taskName, setTaskName }) => {

  return (
    <div className='relative group flex items-center border-b border-b-gray-200 hover:border-b-2 hover:border-b-blue-600'>
        <input 
            type='text'
            className='py-2.5 w-full rounded-sm focus:shadow-md focus:border focus:outline-none focus:border-gray-200 focus:px-2 focus:scale-x-[1.1]'
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            onBlur={() => addTask(taskName)}
        />
    </div>
  )
}

export default AddTask