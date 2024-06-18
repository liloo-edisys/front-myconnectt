/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid,no-undef */
import React, { useEffect } from 'react'

import { getUser } from "actions/backoffice/UserActions";
import Avatar from 'react-avatar'
import SVG from 'react-inlinesvg'
import { FormattedMessage, injectIntl } from 'react-intl'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { Link } from "react-router-dom";
import { useHistory } from 'react-router-dom'

import { persistor } from '../../../../../business/store';
import { toAbsoluteUrl } from '../../../../_helpers'

function QuickUserBackOffice() {
  const history = useHistory()
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getUser.request());
  }, [dispatch]);

  const { user } = useSelector(
    state => ({
      user: state.user.user
    }),
    shallowEqual
  )


  const logoutClick = () => {
    const toggle = document.getElementById('kt_quick_user_toggle')
    if (toggle) {
      toggle.click()
    }
    persistor.purge();
    window.location.replace(`${process.env.REACT_APP_URL}auth/backoffice-login`);
    //history.push('/backoffice-logout');
  }

  const closeMenu = () => {
    const close = document.getElementById('kt_quick_user_close')
    close.click()
  }

  const renderStatus = () => {
    return user && (user.backofficeRole === 1 ? "Super Administrateur" : user.backofficeRole === 2 ? "Administrateur" : "Utilisateur");
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
            {user &&
              (<Avatar
                className='symbol-label'
                color='#3699FF'
                maxInitials={2}
                name={user && user.firstname && user.firstname.concat(' ', user.lastname)}
              />)}
          </div>
          <div className='d-flex flex-column'>
            {user &&
              (<a
                href='#'
                className='font-weight-bold font-size-h5 text-dark-75 text-hover-primary'
              >
                {user && user.firstname && user.firstname.concat(' ', user.lastname)}
              </a>)}
            <div className='text-muted mt-1'>{user && renderStatus()}</div>
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
                    {user && user.email}
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
          {user && (user.backofficeRole === 1 || user.backofficeRole === 2) ? 
          <>
          <Link className="navi-item" to="/mailtemplates" onClick={closeMenu}> 
            <div className='navi-link'>
              <div className='symbol symbol-40 bg-light mr-3'>
                <div className='symbol-label'>
                  <span className='svg-icon svg-icon-md'>
                    <SVG
                      src={toAbsoluteUrl(
                        '/media/svg/icons/Communication/Mail.svg'
                      )}
                    ></SVG>
                  </span>
                </div>
              </div>
              <div className='navi-text'>
                <div className='font-weight-bold'>
                  <FormattedMessage id='TEXT.BACKOFFICE.MAIL.TEMPLATES' />
                </div>
              </div>
            </div>
          </Link>
          <Link className="navi-item" to="/users" onClick={closeMenu}>
            <div className='navi-link'>
              <div className='symbol symbol-40 bg-light mr-3'>
                <div className='symbol-label'>
                  <span className='svg-icon svg-icon-md'>
                    <SVG
                      src={toAbsoluteUrl(
                        '/media/svg/icons/Communication/Group.svg'
                      )}
                    ></SVG>
                  </span>
                </div>
              </div>
              <div className='navi-text'>
                <div className='font-weight-bold'>
                  <FormattedMessage id='TEXT.USERS.MANAGEMENT' />
                </div>
              </div>
            </div>
          </Link>
          <Link className="navi-item" to="/jobskills" onClick={closeMenu}>
            <div className='navi-link'>
              <div className='symbol symbol-40 bg-light mr-3'>
                <div className='symbol-label'>
                  <span className='svg-icon svg-icon-md'>
                    <i className="fas fa-medal text-primary"></i>
                  </span>
                </div>
              </div>
              <div className='navi-text'>
                <div className='font-weight-bold'>
                  <FormattedMessage id='TEXT.JOBSKILL.MANAGEMENT' />
                </div>
              </div>
            </div>
          </Link>
          <Link className="navi-item" to="/jobtags" onClick={closeMenu}>
            <div className='navi-link'>
              <div className='symbol symbol-40 bg-light mr-3'>
                <div className='symbol-label'>
                  <span className='svg-icon svg-icon-md'>
                    <i className="flaticon-customer text-primary"></i>
                  </span>
                </div>
              </div>
              <div className='navi-text'>
                <div className='font-weight-bold'>
                  <FormattedMessage id='TEXT.JOBTAG.MANAGEMENT' />
                </div>
              </div>
            </div>
          </Link>
          <Link className="navi-item" to="/habilitations" onClick={closeMenu}>
            <div className='navi-link'>
              <div className='symbol symbol-40 bg-light mr-3'>
                <div className='symbol-label'>
                  <span className='svg-icon svg-icon-md'>
                    <i className="fas fa-chart-bar text-primary"></i>
                  </span>
                </div>
              </div>
              <div className='navi-text'>
                <div className='font-weight-bold'>
                  <FormattedMessage id='TEXT.HABILITATION.MANAGEMENT' />
                </div>
              </div>
            </div>
          </Link>
          <Link className="navi-item" to="/accounts-group" onClick={closeMenu}>
            <div className='navi-link'>
              <div className='symbol symbol-40 bg-light mr-3'>
                <div className='symbol-label'>
                  <span className='svg-icon svg-icon-md'>
                    <i className="fab fa-battle-net text-primary"></i>
                  </span>
                </div>
              </div>
              <div className='navi-text'>
                <div className='font-weight-bold'>
                  <FormattedMessage id='TEXT.ACCOUNTS.GROUP.MANAGEMENT' />
                </div>
              </div>
            </div>
          </Link>
          <Link className="navi-item" to="/remuneration-elements" onClick={closeMenu}>
            <div className='navi-link'>
              <div className='symbol symbol-40 bg-light mr-3'>
                <div className='symbol-label'>
                  <span className='svg-icon svg-icon-md'>
                    <i className="fab fa-cotton-bureau text-primary"></i>
                  </span>
                </div>
              </div>
              <div className='navi-text'>
                <div className='font-weight-bold'>
                  <FormattedMessage id='TEXT.REMUNERATION.ELEMENT.MANAGEMENT' />
                </div>
              </div>
            </div>
          </Link>
          <Link className="navi-item" to="/jobtitles" onClick={closeMenu}>
            <div className='navi-link'>
              <div className='symbol symbol-40 bg-light mr-3'>
                <div className='symbol-label'>
                  <span className='svg-icon svg-icon-md'>
                    <i className="fab fa-empire text-primary"></i>
                  </span>
                </div>
              </div>
              <div className='navi-text'>
                <div className='font-weight-bold'>
                  <FormattedMessage id='TEXT.JOBTITLE.MANAGEMENT' />
                </div>
              </div>
            </div>
          </Link>
          <Link className="navi-item" to="/setting" onClick={closeMenu}>
            <div className='navi-link'>
              <div className='symbol symbol-40 bg-light mr-3'>
                <div className='symbol-label'>
                  <span className='svg-icon svg-icon-md'>
                    <i className="fab fa-empire text-primary"></i>
                  </span>
                </div>
              </div>
              <div className='navi-text'>
                <div className='font-weight-bold'>
                  <FormattedMessage id='TEXT.BACKOFFICE.SETTING' />
                </div>
              </div>
            </div>
          </Link>
          </> : null}
        </div>
      </div>
    </div>
  )
}

export default injectIntl(QuickUserBackOffice)
