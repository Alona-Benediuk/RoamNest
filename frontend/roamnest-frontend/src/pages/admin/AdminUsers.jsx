import { useEffect, useState } from 'react';
import { getAdminUsers, updateUserStatus } from '../../api/admin';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        getAdminUsers().then(setUsers).catch(console.error);
    }, []);

    const toggleActive = async (id, isActive) => {
        try {
            await updateUserStatus(id, { is_active: !isActive });
            setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, is_active: !isActive } : u)));
        } catch (e) {
            alert('Помилка зміни статусу');
        }
    };

    return (
        <div>
            <h2>Користувачі</h2>
            <table className="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Роль</th>
                        <th>Активний</th>
                        <th>Дія</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((u) => (
                        <tr key={u.id}>
                            <td>{u.id}</td>
                            <td>{u.username}</td>
                            <td>{u.email}</td>
                            <td>{u.role}</td>
                            <td>{u.is_active ? '✅ Так' : '❌ Ні'}</td>
                            <td>
                                <button onClick={() => toggleActive(u.id, u.is_active)} className="btn-secondary">
                                    {u.is_active ? 'Заблокувати' : 'Розблокувати'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminUsers;