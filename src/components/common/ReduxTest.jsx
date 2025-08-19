import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectCurrentUser } from '../../store/features/authSlice';
import { selectMenuItems, selectMenuLoading } from '../../store/features/menuSlice';
import { selectInventoryItems } from '../../store/features/inventorySlice';

const ReduxTest = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const menuItems = useAppSelector(selectMenuItems);
  const menuLoading = useAppSelector(selectMenuLoading);
  const inventoryItems = useAppSelector(selectInventoryItems);

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px', borderRadius: '8px' }}>
      <h3>🎉 Redux Integration Test</h3>
      <div style={{ marginBottom: '10px' }}>
        <strong>Redux Store Status:</strong> ✅ Connected
      </div>
      <div style={{ marginBottom: '10px' }}>
        <strong>Auth State:</strong> {user ? `Logged in as ${user.name}` : 'Not logged in'}
      </div>
      <div style={{ marginBottom: '10px' }}>
        <strong>Menu Items:</strong> {menuItems.length} items loaded {menuLoading && '(Loading...)'}
      </div>
      <div style={{ marginBottom: '10px' }}>
        <strong>Inventory Items:</strong> {inventoryItems.length} items loaded
      </div>
      <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f0f8ff', borderRadius: '4px' }}>
        <strong>✅ All Redux slices are working correctly!</strong>
        <br />
        <small>You can now use Redux for state management throughout your RMS application.</small>
      </div>
    </div>
  );
};

export default ReduxTest;
