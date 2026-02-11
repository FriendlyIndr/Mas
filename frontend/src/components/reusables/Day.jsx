import { CheckCircle2 } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import Task from './Task'
import AddTask from './AddTask'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { API_BASE } from '../../utils/api';

const Day = ({ isTouch, day, date, isToday, tasks, setTasks, handleTaskClick }) => {
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

    async function addTask(taskName) {
        if (!taskName) {
            return;
        }

        try {
            const task = {
                name: taskName,
                done: false,
                date: date,
                order: tasksForDay.length,
            };

            // Post request to backend
            const response = await fetch(`${API_BASE}/tasks/add`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(task),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseData = await response.json();

            setTasks(prev => [
                ...prev,
                responseData.createdTask
            ]);
        } catch (err) {
            console.error('Error creating task:', err);
        } finally {
            setTaskName('');
        }
    }

    async function checkTask(task) {
        try {
            // Send request to check task endpoint
            const response = await fetch(`${API_BASE}/tasks/${task.id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    done: !task.done,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            setTasks(prev => 
                prev.map(t => 
                    t.id === task.id ? { ...t, done: !t.done } : t
                )
            );
        } catch (err) {
            console.error('Error checking task:', err);
        }
    }
    
  return (
    <div ref={setNodeRef} className='md:px-3'>
        {/* Header */}
        <div className='flex justify-between pb-3'>
            <h2 className={`font-bold text-xl ${isToday ? 'text-(--cornflower)' : ''}`}>
                {formattedDate}
            </h2>

            <h2 className={`font-semibold text-xl ${isToday ? 'text-(--cornflower) opacity-40' : 'opacity-20'}`}>
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
                            isTouch={isTouch}
                            task={task}
                            checkTask={checkTask}
                            handleTaskClick={handleTaskClick}
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