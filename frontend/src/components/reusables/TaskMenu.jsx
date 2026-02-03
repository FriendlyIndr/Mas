import React from 'react'
import { Trash, Repeat } from 'lucide-react'

const TaskMenu = ({ dialogRef, clickedTask, setDialogVisible, setTasks }) => {
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
                    onClick={() => deleteTask(clickedTask)}
                >
                    <span className='tooltip_title'>Repeat</span>
                    <Repeat />
                </div>
            </div>
        </div>

        <div className='dialog_task_name'>
            <textarea 
                value={clickedTask.name}
            ></textarea>
        </div>
    </div>
  )
}

export default TaskMenu