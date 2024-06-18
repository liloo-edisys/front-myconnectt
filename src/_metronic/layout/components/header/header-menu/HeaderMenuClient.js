/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid */
import React from 'react'
import { Link } from "react-router-dom";

import SmallLogo from '../../../../../ui/images/logo-myconnectt-color-269x70.png';


export function HeaderMenuClient({ layoutProps, history }) {
  return (
    <div
      id='kt_header_menu'
      className={`header-menu header-menu-mobile header-title ${layoutProps.ktMenuClasses}`}
      {...layoutProps.headerMenuAttributes}
    >
      <Link to="/">
        <div style={{ height: '100%', width: '100%' }}>
          <img className="header-logo-mobile" alt="logo" src={SmallLogo} style={{ height: '100%', width: '100%' }} />
        </div>
      </Link>
    </div>
  )
}
