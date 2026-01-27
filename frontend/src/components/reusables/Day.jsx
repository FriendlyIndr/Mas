import { CheckCircle2 } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import Task from './Task'
import AddTask from './AddTask'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';

const Day = ({ day, date, isToday, tasks, setTasks }) => {
    const [taskName, setTaskName] = useState('');

    const formattedDate = date.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short'
    });

    const { setNodeRef } = useDroppable({
        id: date.toDateString(),
        data: { type: 'DAY', date }
    });

    const tasksForDay = useMemo(
        () => 
            tasks
                .filter(
                    t => new Date(t.date).toDateString() === date.toDateString()
                )
                .sort((a, b) => a.order - b.order),
        [tasks, date]
    );

    function addTask(taskName) {
        if (!taskName) {
            return;
        }

        setTasks(prev => [
            ...prev,
            {
                name: taskName,
                done: false,
                id: crypto.randomUUID(),
                date: new Date(date),
                order: tasksForDay.length,
            }
        ]);
        setTaskName('');
    }

    function checkTask(task) {
        setTasks(prev => 
            prev.map(t => 
                t.id === task.id ? { ...t, done: !t.done } : t
            )
        );
    }
    
  return (
    <div ref={setNodeRef} className='px-3'>
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
                items={tasksForDay.map(t => t.id)}
                strategy={verticalListSortingStrategy}
            >
                {tasksForDay.map((task, i) => {
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