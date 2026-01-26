import React from 'react'

const Day = ({ day, date }) => {
  return (
    <div className='px-3'>
        {/* Header */}
        <div className='flex justify-between pb-3'>
            <h2 className='font-bold text-xl'>
                {date}
            </h2>

            <h2 className='text-gray-300 font-semibold text-xl'>
                {day}
            </h2>
        </div>

        {/* Tasks */}
        <div className='border-t-2'>

        </div>
    </div>
  )
}

export default Day