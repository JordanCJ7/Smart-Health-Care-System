import { Outlet } from 'react-router-dom';

export default function StaffLayout() {
  // Navigation component already renders the sidebar; don't duplicate it here.
  return (
    <div className="content-with-sidebar staff-content min-h-screen bg-gray-50">
      <div className="content-inner panel-padding">
        <Outlet />
      </div>
    </div>
  );
}
