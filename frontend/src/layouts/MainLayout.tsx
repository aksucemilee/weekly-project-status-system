import { Outlet } from 'react-router'

function MainLayout() {
  return (
    <div>
      <header>
        <h2>Weekly Project Status System</h2>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout