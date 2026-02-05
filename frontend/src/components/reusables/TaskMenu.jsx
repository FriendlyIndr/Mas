import React, { useEffect, useRef, useState } from 'react'
import { Trash, Repeat, Check, CheckCircle2 } from 'lucide-react'
import apiFetch from '../../utils/apiFetch';
import { useClickOutside } from '../../hooks/useClickOutside';

const TaskMenu = ({ dialogRef, clickedTask, setClickedTask, setDialogVisible, setTasks }) => {
    const [isRepeatMenuOpen, setIsRepeatMenuOpen] = useState(false);

    const repeatMenuRef = useRef(null);

    useClickOutside(repeatMenuRef, setIsRepeatMenuOpen, isRepeatMenuOpen);

    async function checkTask(task) {
        try {
            // Send request to check task endpoint
            const response = await apiFetch(`http://localhost:3000/tasks/${task.id}`, {
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

            setClickedTask(prev => ({
                ...prev,
                done: !prev.done,
            }));

            setTasks(prev => 
                prev.map(t => 
                    t.id === task.id ? { ...t, done: !t.done } : t
                )
            );
        } catch (err) {
            console.error('Error checking task:', err);
        }
    }

    async function deleteTask(task) {
        try {
            const response = await apiFetch(`http://localhost:3000/tasks/${task.id}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            setDialogVisible(false);
            setTasks(prev => (
                prev.filter(function(t) {
                return t.id !== task.id;
                })
            ));
        } catch (err) {
            console.error('Error deleting task:', err);
        }
    }

    async function handleRepeatClick() {
        setIsRepeatMenuOpen(true);
        console.log('repeat period')
    }

  return (
    <div 
        className='task_menu dialog withPaddings sizeMedium'
        ref={dialogRef}
    >
        <div className='top_options_container'>
            <div className='date_picker'>

            </div>
            
            <div className='task_options'>
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
                                    <div className='flex items-center gap-2'>
                                        <Check />
                                        <span>
                                            Never
                                        </span>
                                    </div>
                                </div>

                                <div className='flex items-center gap-2'>
                                    <Check />
                                    <span>
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