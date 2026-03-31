/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid */
import React from 'react'
import { Link, NavLink } from 'react-router-dom';
import BlankLogo from '../../../../../ui/images/logo-myconnectt-color-269x70.png';

export function HeaderMenuInterimaire({ layoutProps }) {
  return (
    <div
      id='kt_header_menu'
      className={`header-menu header-menu-mobile header-title ${layoutProps.ktMenuClasses}`}
      {...layoutProps.headerMenuAttributes}
    >
      <Link to='/'>
        <img src={BlankLogo} />
      </Link>
    </div>
  )
}
