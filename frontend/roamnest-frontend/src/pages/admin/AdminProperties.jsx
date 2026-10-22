import { useEffect, useState } from 'react';
import { getAdminProperties, updateAdminProperty, deleteAdminProperty } from '../../api/admin';

const AdminProperties = () => {
    const [properties, setProperties] = useState([]);

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = () => {
        getAdminProperties().then(setProperties).catch(console.error);
    };

    const togglePublished = async (id, isPublished) => {
        try {
            await updateAdminProperty(id, { is_published: !isPublished });
            setProperties((prev) => prev.map((p) => (p.id === id ? { ...p, is_published: !isPublished } : p)));
        } catch (e) {
            alert('Помилка оновлення');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Видалити об\'єкт?')) return;
        try {
            await deleteAdminProperty(id);
            setProperties((prev) => prev.filter((p) => p.id !== id));
        } catch (e) {
            alert('Помилка видалення');
        }
    };

    return (
        <div>
            <h2>Всі об'єкти житла</h2>
            <table className="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Назва</th>
                        <th>Місто</th>
                        <th>Опубліковано</th>
                        <th>Дії</th>
                    </tr>
                </thead>
                <tbody>
                    {properties.map((p) => (
                        <tr key={p.id}>
                            <td>{p.id}</td>
                            <td>{p.title}</td>
                            <td>{p.city}</td>
                            <td>{p.is_published ? '✅ Так' : '❌ Ні'}</td>
                            <td>
                                <div className="flex-row-gap">
                                    <button onClick={() => togglePublished(p.id, p.is_published)} className="btn-secondary">
                                        {p.is_published ? 'Приховати' : 'Опублікувати'}
                                    </button>
                                    <button onClick={() => handleDelete(p.id)} className="btn-danger">
                                        Видалити
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminProperties;