import React from 'react';
import { useHistory } from 'react-router-dom';

function Home() {
    const history = useHistory();

    const redirectTo = (path) => {
        history.push(path);
    };
 
    return (
        <div style={styles.container}>
            <h1 style={styles.title}><b>PHARMA SUPPLY CHAIN</b></h1>
            <div style={styles.buttons}>
                <div style={styles.buttonContainer}>
                    <h3>Assign Roles</h3>
                    <p>Register manufacturers, shipping, distributors, and warehouses to track.</p>
                    <button onClick={() => redirectTo('/roles')} style={styles.button}>Register</button>
                </div>
                <div style={styles.buttonContainer}>
                    <h3>Order Products</h3>
                    <p>Order Products from manufacturers.</p>
                    <button onClick={() => redirectTo('/addmed')} style={styles.button}>Order</button>
                </div>
                <div style={styles.buttonContainer}>
                    <h3>Control Supply Chain</h3>
                    <p>Monitor and manage the shipments.</p>
                    <button onClick={() => redirectTo('/supply')} style={styles.button}>Control</button>
                </div>
                <div style={styles.buttonContainer}>
                    <h3>View Transactions</h3>
                    <p>See all payment transactions.</p>
                    <button onClick={() => redirectTo('/transactions')} style={styles.button}>View</button>
                </div>
            </div>
            <hr style={styles.divider} />
            <h2>Track Products</h2>
            <button onClick={() => redirectTo('/track')} style={styles.trackButton}>Track</button>
        </div>
    );
}

const styles = {
    container: {
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
        maxWidth: '800px',
        margin: 'auto',
    },
    title: {
        color: '#2D3250',
        fontSize: '32px',
        marginBottom: '20px',
    },
    buttons: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '40px',
    },
    buttonContainer: {
        backgroundColor: '#f7f7f7',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
        marginBottom: '20px',
        minWidth: '300px',
        maxWidth: '500px',
        width: '80%',
    },
    button: {
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        padding: '10px 20px',
        fontSize: '16px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
        width: '100%',
    },
    divider: {
        borderTop: '2px solid #007bff',
        width: '50%',
        margin: '40px auto',
    },
    trackButton: {
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        padding: '15px 30px',
        fontSize: '18px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },
};

export default Home;
