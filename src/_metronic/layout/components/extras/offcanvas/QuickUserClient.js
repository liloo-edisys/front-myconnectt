/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid,no-undef */
import React, { useEffect } from 'react'

import { getUser } from "actions/client/UserActions";
import Avatar from 'react-avatar'
import SVG from 'react-inlinesvg'
import { FormattedMessage, injectIntl } from 'react-intl'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { Link } from "react-router-dom";
import { useHistory } from 'react-router-dom'

import { persistor } from '../../../../../business/store';
import { toAbsoluteUrl } from '../../../../_helpers'

function QuickUserClient() {
  const history = useHistory()
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getUser.request());
  }, [dispatch]);

  const { contact } = useSelector(
    state => ({
      contact: state.contacts.user
    }),
    shallowEqual
  )


  const logoutClick = () => {
    const toggle = document.getElementById('kt_quick_user_toggle')
    if (toggle) {
      toggle.click()
    }
    persistor.purge();
    window.location.replace(`${process.env.REACT_APP_URL}auth/login`);
    //history.push('/logout');
  }

  const closeMenu = () => {
    const close = document.getElementById('kt_quick_user_close')
    close.click()
  }

  const renderStatus = () => {
    return contact && contact.isAdmin ? 'Administrateur' : 'Utilisateur'
  }
  return (
    <div
      id='kt_quick_user'
      className='offcanvas offcanvas-right offcanvas p-10'
    >
      <div className='offcanvas-header d-flex align-items-left justify-content-between pb-5'>
        <h3 className='font-weight-bold m-0'>
          <FormattedMessage id='USER.MENU.TITLE' />
        </h3>
        <a
          href='#'
          className='btn btn-xs btn-icon btn-light btn-hover-primary'
          id='kt_quick_user_close'
        >
          <i className='ki ki-close icon-xs text-muted' />
        </a>
      </div>

      <div className='offcanvas-content pr-5 mr-n5'>
        <div className='d-flex align-items-center mt-5'>
          <div className='symbol symbol-100 mr-5'>
            {contact &&
              (<Avatar
                className='symbol-label'
                color='#3699FF'
                maxInitials={2}
                name={contact && contact.firstname && contact.firstname.concat(' ', contact.lastname)}
              />)}
          </div>
          <div className='d-flex flex-column'>
            {contact &&
              (<a
                href='#'
                className='font-weight-bold font-size-h5 text-dark-75 text-hover-primary'
              >
                {contact && contact.firstname && contact.firstname.concat(' ', contact.lastname)}
              </a>)}
            <div className='text-muted mt-1'>{contact && renderStatus()}</div>
            <div className='navi mt-2'>
              <a href='#' className='navi-item'>
                <span className='navi-link p-0 pb-2'>
                  <span className='navi-icon mr-1'>
                    <span className='svg-icon-lg '>
                      <SVG
                        src={toAbsoluteUrl(
                          '/media/svg/icons/Communication/Mail.svg'
                        )}
                      ></SVG>
                    </span>
                  </span>
                  <span className='navi-text text-muted text-hover-primary'>
                    {contact && contact.email}
                  </span>
                </span>
              </a>
            </div>
            <div className='navi mt-2'>
              <a href='#' className='navi-item'>
                <span className='navi-link p-0 pb-2'>
                  <span className='navi-icon mr-1'>
                    <span className='svg-icon-lg '>
                      <SVG
                        src={toAbsoluteUrl(
                          '/media/svg/icons/Communication/Call.svg'
                        )}
                      ></SVG>
                    </span>
                  </span>
                  <span className='navi-text text-muted text-hover-primary'>
                    {contact && contact.mobilePhoneNumber && contact.mobilePhoneNumber.replace(/(.{2})(?!$)/g, "$1 ")}
                  </span>
                </span>
              </a>
            </div>
          </div>
        </div>
        <div className='d-flex mt-5 justify-content-center'>
          <button
            className="btn btn-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
            onClick={logoutClick}
          >
            <FormattedMessage id='BUTTON.LOGOUT' />
          </button>
        </div>

        <div className='navi navi-spacer-x-0 p-0'>
          <Link className="navi-item" to="/profile" onClick={closeMenu}>
            <div className='navi-link'>
              <div className='symbol symbol-40 bg-light mr-3'>
                <div className='symbol-label'>
                  <span className='svg-icon svg-icon-md '>
                    <SVG
                      src={toAbsoluteUrl(
                        '/media/svg/icons/General/User.svg'
                      )}
                    ></SVG>
                  </span>
                </div>
              </div>
              <div className='navi-text'>
                <div className='font-weight-bold'>
                  <FormattedMessage id='USER.MENU.NAV.MANAGE_ACCOUNT' />
                </div>
              </div>
            </div>
          </Link>

          <Link className="navi-item" to="/companies" onClick={closeMenu}>
            <div className='navi-link'>
              <div className='symbol symbol-40 bg-light mr-3'>
                <div className='symbol-label'>
                  <span className='svg-icon svg-icon-md'>
                    <SVG
                      src={toAbsoluteUrl(
                        '/media/svg/icons/Media/Pause.svg'
                      )}
                    ></SVG>
                  </span>
                </div>
              </div>
              <div className='navi-text'>
                <div className='font-weight-bold'>
                  <FormattedMessage id='USER.MENU.NAV.SITES' />
                </div>
              </div>
            </div>
          </Link>

          {contact && contact.isAdmin ? <Link to='/contacts' onClick={closeMenu} className='navi-item kt_quick_user_close'>
            <div className='navi-link'>
              <div className='symbol symbol-40 bg-light mr-3'>
                <div className='symbol-label'>
                  <span className='svg-icon svg-icon-md '>
                    <SVG
                      title='Envoyer un message'
                      src={toAbsoluteUrl(
                        '/media/svg/icons/Communication/Group.svg'
                      )}
                    ></SVG>
                  </span>
                </div>
              </div>
              <div className='navi-text'>
                <div className='font-weight-bold'>
                  <FormattedMessage id='USER.MENU.NAV.MANAGE_USERS' />
                </div>
              </div>
            </div>
          </Link> : null}

          <Link className="navi-item" to="/remunerations" onClick={closeMenu}>
            <div className='navi-link'>
              <div className='symbol symbol-40 bg-light mr-3'>
                <div className='symbol-label'>
                  <span className='svg-icon svg-icon-md'>
                    <SVG
                      src={toAbsoluteUrl(
                        '/media/svg/icons/Shopping/Euro.svg'
                      )}
                    ></SVG>
                  </span>
                </div>
              </div>
              <div className='navi-text'>
                <div className='font-weight-bold'>
                  <FormattedMessage id='USER.MENU.NAV.MANAGE_PAYMENTS' />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default injectIntl(QuickUserClient)
