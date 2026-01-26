import { CheckCircle2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import Task from './Task'
import AddTask from './AddTask'

const Day = ({ day, date, isToday }) => {
    const [tasksList, setTasksList] = useState([]);
    const [taskName, setTaskName] = useState('');

    function addTask(taskName) {
        if (!taskName) {
            return;
        }

        setTasksList(prev => [
            ...prev,
            {
                name: taskName,
                done: false,
                id: tasksList.length,
                date: new Date(date)
            }
        ]);
        setTaskName('');
    }

    function checkTask(task) {
        
    }

    useEffect(() => {
        setTasksList([
            {
                name: 'Task 1',
                done: false,
                id: 0,
                date: new Date(date)
            },
            {
                name: 'Task 2',
                done: true,
                id: 1,
                date: new Date(date)
            },
        ]);
    }, []);
    
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
            {tasksList.map((task, i) => {
                return (
                    <Task 
                        task={task}
                    />
                );
            })}
            <AddTask 
                addTask={addTask}
                taskName={taskName}
                setTaskName={setTaskName}
            />
        </div>
    </div>
  )
}

export default Day