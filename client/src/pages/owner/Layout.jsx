import React, { useEffect } from 'react'
import NavbarOwner from '../../components/owner/NavbarOwner'
import Sidebar from '../../components/owner/Sidebar'
import { Outlet } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import Loader from '../../components/Loader'

const Layout = () => {
  const {isOwner, authLoading, navigate} = useAppContext()

  useEffect(()=>{
    if(!authLoading && !isOwner){
      navigate('/')
    }
  },[isOwner, authLoading, navigate])

  if(authLoading){
    return <Loader />
  }

  if(!isOwner){
    return null
  }

  return (
    <div className='flex flex-col'>
      <NavbarOwner />
      <div className='flex'>
        <Sidebar />
        <Outlet />
      </div>
    </div>
  )
}

export default Layout
