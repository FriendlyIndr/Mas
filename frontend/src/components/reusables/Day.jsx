import { CheckCircle2 } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import Task from './Task'
import AddTask from './AddTask'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import apiFetch from '../../utils/apiFetch';
import { toggleTaskDone } from '../../utils/tasksApi';
import ProgressCircle from '../ProgressCircle';

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

    const parentTasks = tasksForDay.filter(t => !t.parentId);
    const subtasks = tasksForDay.filter(t => t.parentId);

    const structured = parentTasks.map(t => ({
        ...t,
        subtasks: subtasks.filter(st => st.parentId === t.id)
    }));

    const completionRate = useMemo(() => {
        if (tasksForDay.length === 0) return;

        const completed = tasksForDay.filter(t => t.done).length;

        return Math.round((completed / tasksForDay.length) * 100);
    }, [tasksForDay]);

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
            const response = await apiFetch(`/tasks/add`, {
                method: 'POST',
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
        setTasks(prev => 
            prev.map(t => 
                t.id === task.id ? { ...t, done: !t.done } : t
            )
        );

        try {
            await toggleTaskDone(task);
        } catch (err) {
            console.error('Error checking task:', err);
        }
    }
    
  return (
    <div ref={setNodeRef} className='md:px-3'>
        {/* Header */}
        <div className='flex justify-between items-center pb-3'>
            <h2 className={`font-bold text-xl ${isToday ? 'text-(--cornflower)' : ''}`}>
                {formattedDate}
            </h2>

            <div className='flex items-center gap-2'>
                {tasksForDay.length > 0 && (
                    // <span className='text-sm font-bold flex items-center px-2 py-0.5 rounded-full bg-gray-200'>
                    //     {completionRate}%
                    // </span>
                    <ProgressCircle percent={completionRate} />
                )}

                <h2 className={`font-semibold text-xl ${isToday ? 'text-(--cornflower) opacity-40' : 'opacity-20'}`}>
                    {day}
                </h2>
            </div>
        </div>

        {/* Tasks */}
        <div className={`border-t-2 ${isToday ? 'border-t-blue-600' : ''}`}>
            <SortableContext
                items={tasksForDay.map(t => t.id)}
                strategy={verticalListSortingStrategy}
            >
                {structured.map((task) => {
                    return (
                        <div key={task.id}>
                            <Task 
                                isTouch={isTouch}
                                task={task}
                                checkTask={checkTask}
                                handleTaskClick={handleTaskClick}
                                key={task.id}
                            />

                            {task.subtasks?.map(st => (
                                <div className='pl-4'>
                                    <Task 
                                        key={st.id} 
                                        task={st}
                                        checkTask={checkTask} 
                                        handleTaskClick={handleTaskClick}
                                        isSubTask 
                                    />
                                </div>
                            ))}
                        </div>
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