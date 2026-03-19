import React from 'react';
import { useNavigate } from 'react-router-dom';

const MenuPage: React.FC = () => {
    const navigate = useNavigate();
    
    // Redirect to home if accessed directly
    React.useEffect(() => {
        navigate('/', { replace: true });
    }, [navigate]);

    return null;
};

export default MenuPage;