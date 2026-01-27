import { CheckCircle2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import Task from './Task'
import AddTask from './AddTask'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

const Day = ({ day, date, isToday, tasks, setTasks }) => {
    const [tasksList, setTasksList] = useState([]);
    const [taskName, setTaskName] = useState('');

    const formattedDate = date.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short'
    });

    function addTask(taskName) {
        if (!taskName) {
            return;
        }

        setTasks(prev => [
            ...prev,
            {
                name: taskName,
                done: false,
                id: tasksList.length,
                date: new Date(date),
                order: tasksList.length,
            }
        ]);
        setTaskName('');
    }

    function checkTask(task) {
        setTasks(prev => prev.map(taskObj => {
            if (taskObj.id === task.id) {
                return { ...taskObj, done: !taskObj.done };
            }

            return taskObj;
        }));
    }

    useEffect(() => {
        let calculatedTasksList = [];
        for (const t of tasks) {
            if (t.date.toDateString() === date.toDateString()) {
                calculatedTasksList.push(t);
            }
        }
        setTasksList(calculatedTasksList);
    }, [tasks, date]);
    
  return (
    <div className='px-3'>
        {/* Header */}
        <div className='flex justify-between pb-3'>
            <h2 className={`font-bold text-xl ${isToday ? 'text-blue-600' : ''}`}>
                {formattedDate}
            </h2>

            <h2 className={`font-semibold text-xl ${isToday ? 'text-blue-300' : 'text-gray-300'}`}>
                {day}
            </h2>
        </div>

        {/* Tasks */}
        <div className={`border-t-2 ${isToday ? 'border-t-blue-600' : ''}`}>
            <SortableContext
                items={tasksList.map(t => t.id)}
                strategy={verticalListSortingStrategy}
            >
                {tasksList.map((task, i) => {
                    return (
                        <Task 
                            task={task}
                            checkTask={checkTask}
                            key={task.id}
                        />
                    );
                })}
            </SortableContext>
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