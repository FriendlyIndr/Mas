import React, { useState } from 'react'
import { Trash, Repeat, Check } from 'lucide-react'

const TaskMenu = ({ dialogRef, clickedTask, setDialogVisible, setTasks }) => {
    const [isRepeatMenuOpen, setIsRepeatMenuOpen] = useState(false);

    async function deleteTask(task) {
        try {
            const response = await fetch(`http://localhost:3000/tasks/${task.id}`, {
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
                        <div className='repeat_task_menu_container'>
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

        <div className='dialog_task_name'>
            <div>
                <textarea 
                    value={clickedTask.name}
                ></textarea>
            </div>
        </div>
    </div>
  )
}

export default TaskMenu