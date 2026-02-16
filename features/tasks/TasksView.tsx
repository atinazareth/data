import React, { useState, useEffect } from 'react';
import { Task } from '../../types';
import { fetchTasks, updateTaskStatus } from '../../services/googleSheetsService';

const TasksView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState<string>('');
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks()
      .then(data => {
        setTasks(data);
        setLoading(false);
      })
      .catch(err => {
        setError('فشل في تحميل المهام');
        setLoading(false);
      });
  }, []);

  const handleTaskToggle = async (task: Task) => {
    const newStatus = task.status === 'pending' ? 'completed' : 'pending';
    setUpdatingTaskId(task.id);
    
    const success = await updateTaskStatus(task.title, newStatus, task.comment);
    
    if (success) {
      setTasks(tasks.map(t => 
        t.id === task.id ? { ...t, status: newStatus } : t
      ));
    }
    
    setUpdatingTaskId(null);
  };

  const handleCommentSave = async (task: Task) => {
    if (!commentInput.trim() && !task.comment) return;
    
    setUpdatingTaskId(task.id);
    const success = await updateTaskStatus(task.title, task.status, commentInput || task.comment);
    
    if (success) {
      setTasks(tasks.map(t => 
        t.id === task.id ? { ...t, comment: commentInput || task.comment } : t
      ));
      setEditingTaskId(null);
      setCommentInput('');
    }
    
    setUpdatingTaskId(null);
  };

  const handleCommentKeyPress = (e: React.KeyboardEvent, task: Task) => {
    if (e.key === 'Enter') {
      handleCommentSave(task);
    }
  };

  if (loading) return <div className="p-20 text-center font-bold text-slate-400 animate-pulse">جاري جلب المهام...</div>;
  
  if (error) return <div className="p-10 text-center text-red-500 font-bold">{error}</div>;

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-6">
        <h2 className="text-3xl font-black text-slate-800">المهام</h2>
        <div className="text-blue-600 font-black px-4 py-2 bg-blue-50 rounded-xl">
          العدد الإجمالي: {tasks.length}
        </div>
      </div>

      <div className="space-y-4">
        {tasks.length > 0 ? tasks.map((task) => (
          <div 
            key={task.id} 
            className={`relative rounded-2xl p-6 shadow-md transition-all duration-200 border-2 ${
              task.status === 'completed' 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-start gap-4 mb-4">
              <input
                type="checkbox"
                checked={task.status === 'completed'}
                onChange={() => handleTaskToggle(task)}
                disabled={updatingTaskId === task.id}
                className="w-6 h-6 mt-1 cursor-pointer accent-green-600 transition-all"
              />
              <div className="flex-grow">
                <h3 className={`text-xl font-bold mb-1 ${
                  task.status === 'completed' 
                    ? 'text-green-700 line-through' 
                    : 'text-red-700'
                }`}>
                  {task.title}
                </h3>
                {task.comment && !editingTaskId && (
                  <p className="text-sm text-slate-600 bg-white/50 p-2 rounded mt-2">
                    <span className="font-bold">تعليق:</span> {task.comment}
                  </p>
                )}
              </div>
            </div>

            {/* Comment Input Section */}
            {editingTaskId === task.id && (
              <div className="bg-white/60 rounded-lg p-3 flex gap-2">
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  onKeyPress={(e) => handleCommentKeyPress(e, task)}
                  placeholder="أضف تعليقاً..."
                  autoFocus
                  className="flex-grow px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                  dir="rtl"
                />
                <button
                  onClick={() => handleCommentSave(task)}
                  disabled={updatingTaskId === task.id}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-bold"
                  title="حفظ (Enter)"
                >
                  💾
                </button>
              </div>
            )}

            {/* Add/Edit Comment Button */}
            {editingTaskId !== task.id && (
              <button
                onClick={() => {
                  setEditingTaskId(task.id);
                  setCommentInput(task.comment || '');
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-bold mt-2 flex items-center gap-1 transition-colors"
              >
                💬 {task.comment ? 'تعديل التعليق' : 'إضافة تعليق'}
              </button>
            )}
          </div>
        )) : (
          <div className="py-20 text-center text-slate-400 italic">
            لا توجد مهام مسجلة في ورقة البيانات.
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksView;
