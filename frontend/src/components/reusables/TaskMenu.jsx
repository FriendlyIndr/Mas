import React, { useEffect, useRef, useState } from 'react'
import { Trash, Repeat, Check, CheckCircle2, FolderTree } from 'lucide-react'
import apiFetch from '../../utils/apiFetch';
import { useClickOutside } from '../../hooks/useClickOutside';
import { createRecurrenceRuleString } from '../../utils/createRecurrenceRuleString';
import { toggleTaskDone } from '../../utils/tasksApi';
import { detectRepeatPeriod } from '../../utils/detectRepeatPeriod';

const TaskMenu = ({ dialogRef, clickedTask, setClickedTask, setDialogVisible, setTasks, possibleParents }) => {
    const [repeatPeriod, setRepeatPeriod] = useState(clickedTask.rrule ? detectRepeatPeriod(clickedTask.rrule) : null);
    const [isRepeatMenuOpen, setIsRepeatMenuOpen] = useState(false);
    const [isParentMenuOpen, setIsParentMenuOpen] = useState(false);

    const repeatMenuRef = useRef(null);
    const parentMenuRef = useRef(null);

    useClickOutside(repeatMenuRef, setIsRepeatMenuOpen, isRepeatMenuOpen);
    useClickOutside(parentMenuRef, setIsParentMenuOpen, isParentMenuOpen);

    async function checkTask(task) {
        setClickedTask(prev => ({
            ...prev,
            done: !prev.done,
        }));

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

    async function deleteTask(task) {
        try {

            let response;

            if (task.isRecurring) {
                response = await apiFetch(`/task-series/${task.seriesId}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        endDate: task.date,
                    })
                });
            } else {
                response = await apiFetch(`/tasks/${task.id}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            setDialogVisible(false);
            setTasks(prev => (
                prev.filter(t => {
                    if (task.isRecurring) {
                        return t.seriesId !== task.seriesId || t.date < task.date;
                    }
                    return t.id !== task.id;
                })
            ));
        } catch (err) {
            console.error('Error deleting task:', err);
        }
    }

    async function handleTaskChange(task, e) {
        const value = e.target.value;

        setClickedTask(prev => ({
            ...prev,
            name: value,
        }));

        setTasks(prev => 
            prev.map(t =>
                t.isRecurring
                    ? t.seriesId === task.seriesId
                        ? { ...t, name: value }
                        : t
                    : t.id === task.id 
                        ? { ...t, name: value } 
                        : t
            )
        );

        // Debounce API call
        clearTimeout(window.taskEditTimeout);
        window.taskEditTimeout = setTimeout(async () => {
            try {
                let url;

                if (task.isRecurring) {
                    url = `/task-series/${task.seriesId}`;
                } else {
                    url = `/tasks/${task.id}`;
                }

                const response = await apiFetch(url, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: value,
                    }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
            } catch (err) {
                console.error('Error editing task name:', err);
            }
        }, 500);
    }

    async function updateParentTask(task, parentId) {
        setClickedTask(prev => ({
            ...prev,
            parentId
        }));

        // Update UI immediately
        setTasks(prev =>
            prev.map(t =>
                t.id === task.id
                    ? { ...t, parentId }
                    : t
            )
        );

        // Send to backend
        try {
            const url = `/task-series/${task.seriesId}`;

            const response = await apiFetch(url, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ parentId })
            });

            if (!response.ok) throw new Error(response.status);
        } catch (err) {
            console.error('Error updating parentId:', err);
        }
    }

    function handleRepeatClick() {
        setIsRepeatMenuOpen(true);
        console.log('repeat period')
    }

    const firstRender = useRef(true);

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }

        if (repeatPeriod === undefined) return;

        const timeout = setTimeout(async () => {
            try {
                const res = await apiFetch(`/task-series/add`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        taskId: clickedTask.id,
                        rrule: createRecurrenceRuleString(repeatPeriod),
                    }),
                });

                if (!res.ok) throw new Error(res.status);
            } catch (err) {
                console.error('Error changing repeat period:', err);
            }
        }, 500);

        return () => clearTimeout(timeout);
    }, [repeatPeriod]);

  return (
    <div 
        className='task_menu dialog withPaddings sizeMedium'
        ref={dialogRef}
    >
        <div className='top_options_container'>
            <div className='date_picker'>

            </div>
            
            <div className='task_options'>
                {clickedTask.isRecurring && (
                    <div
                        className='tooltip_container'
                        onClick={() => setIsParentMenuOpen(true)}
                    >
                        <span className='tooltip_title'>Make Subtask Of</span>
                        <FolderTree />

                        {isParentMenuOpen && (
                            <div
                                className='repeat_task_menu_container'
                                ref={parentMenuRef}
                            >
                                <div className='parent_task_menu'>
                                    {possibleParents.length === 0 && (
                                        <div>
                                            No parent tasks available
                                        </div>
                                    )}

                                    {possibleParents.map(p => (
                                        <div
                                            key={p.id}
                                            className='flex items-center gap-2 pb-2 cursor-pointer'
                                            onClick={() => updateParentTask(clickedTask, p.id)}
                                        >
                                            {clickedTask.parentId === p.id && <Check />}
                                            <span>{p.name}</span>
                                        </div>
                                    ))}

                                    {clickedTask.parentId && (
                                        <div
                                            className='border-t'
                                            onClick={() => updateParentTask(clickedTask, null)}
                                        >
                                            <span>Remove Parent</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div 
                    className='tooltip_container'
                    onClick={() => deleteTask(clickedTask)}
                >
                    <span className='tooltip_title'>Delete</span>
                    <Trash />
                </div>

                <div 
                    className='tooltip_container'
                    onClick={() => handleRepeatClick()}
                >
                    <span className='tooltip_title'>Repeat</span>
                    <Repeat />

                    {isRepeatMenuOpen && (
                        <div 
                            className='repeat_task_menu_container'
                            ref={repeatMenuRef}
                        >
                            <div className='repeat_task_menu'>
                                <div className='pb-2 mb-2 border-b'>
                                    <div 
                                        onClick={() => setRepeatPeriod(null)}
                                        className='flex items-center gap-2'
                                    >
                                        {repeatPeriod === null && (
                                            <Check />
                                        )}
                                        <span>
                                            Never
                                        </span>
                                    </div>
                                </div>

                                <div 
                                    onClick={() => setRepeatPeriod('daily')}
                                    className='flex items-center gap-2'
                                >
                                    {repeatPeriod === 'daily' && (
                                        <Check />
                                    )}
                                    <span className='ml-auto'>
                                        Daily
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className={`dialog_task_name ${clickedTask.done ? 'done_dialog_task_name' : ''}`}>
            <div>
                <textarea 
                    value={clickedTask.name}
                    onChange={(e) => handleTaskChange(clickedTask, e)}
                    className='text-[24px] leading-7'
                ></textarea>
            </div>

            {/* Toggle */}
            <div
                className={`menu_toggle_container ${clickedTask?.done ? 'text-gray-400' : ''}`}
                onClick={() => checkTask(clickedTask)}
            >
                <CheckCircle2 size={20}/>
            </div>
        </div>
    </div>
  )
}

export default TaskMenu