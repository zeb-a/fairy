import React, { useState } from 'react';
import { useClassContext } from '../contexts/ClassContext';

const Classes = () => {
  const { classes, addClass: contextAddClass, deleteClass, updateClass } = useClassContext();
  const [newClassName, setNewClassName] = useState('');
  const [newClassDescription, setNewClassDescription] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [deletingClassId, setDeletingClassId] = useState(null);

  const handleAddClass = async (e) => {
    e.preventDefault();
    if (newClassName.trim()) {
      const newClass = await contextAddClass({
        name: newClassName.trim(),
        description: newClassDescription.trim()
      });
      if (newClass) {
        setNewClassName('');
        setNewClassDescription('');
        setShowAddModal(false);
      }
    }
  };

  const handleEditClass = async (e) => {
    e.preventDefault();
    if (editingClass && editName.trim()) {
      const updatedClass = await updateClass(editingClass.id, {
        name: editName.trim(),
        description: editDescription.trim()
      });
      
      if (updatedClass) {
        setEditingClass(null);
        setEditName('');
        setEditDescription('');
      }
    }
  };

  const handleDeleteClass = async (classId) => {
    setDeletingClassId(classId);
    const success = await deleteClass(classId);
    if (success) {
      // The context already handles updating the state
    }
    setDeletingClassId(null);
  };

  const startEditClass = (cls) => {
    setEditingClass(cls);
    setEditName(cls.name);
    setEditDescription(cls.description);
  };

  const cancelEdit = () => {
    setEditingClass(null);
    setEditName('');
    setEditDescription('');
  };

  return (
    <div className="classes-management">
      <h1>Manage Classes</h1>
      
      <div className="classes-actions">
        <button 
          className="btn-primary" 
          onClick={() => setShowAddModal(true)}
        >
          Add New Class
        </button>
      </div>
      
      <div className="classes-grid">
        {classes.map(cls => (
          <div key={cls.id} className="class-card glass">
            {editingClass?.id === cls.id ? (
              <form onSubmit={handleEditClass} className="edit-class-form">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Class name"
                  required
                  className="class-input"
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Class description"
                  className="class-input"
                />
                <div className="form-actions">
                  <button type="submit" className="btn-primary">Save</button>
                  <button type="button" onClick={cancelEdit} className="btn-secondary">Cancel</button>
                </div>
              </form>
            ) : (
              <div className="class-info">
                <h3>{cls.name}</h3>
                <p>{cls.description || 'No description'}</p>
                <div className="class-actions">
                  <button 
                    className="btn-secondary"
                    onClick={() => startEditClass(cls)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn-danger"
                    onClick={() => handleDeleteClass(cls.id)}
                    disabled={deletingClassId === cls.id}
                  >
                    {deletingClassId === cls.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Class Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Class</h2>
            <form onSubmit={handleAddClass}>
              <div className="form-group">
                <label htmlFor="className">Class Name:</label>
                <input
                  type="text"
                  id="className"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="Enter class name"
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label htmlFor="classDescription">Description:</label>
                <textarea
                  id="classDescription"
                  value={newClassDescription}
                  onChange={(e) => setNewClassDescription(e.target.value)}
                  placeholder="Enter class description (optional)"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">Create Class</button>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classes;