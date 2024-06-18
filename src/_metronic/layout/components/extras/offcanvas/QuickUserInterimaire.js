/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid,no-undef */
import React, { useEffect } from 'react'

import { getInterimaire } from "actions/interimaire/InterimairesActions";
import Avatar from 'react-avatar'
import SVG from 'react-inlinesvg'
import { FormattedMessage, injectIntl } from 'react-intl'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { Link } from "react-router-dom";

import { persistor } from '../../../../../business/store';
import { toAbsoluteUrl } from '../../../../_helpers'
import isNullOrEmpty from '../../../../../utils/isNullOrEmpty';

function QuickUserInterimaire() {
  const history = useHistory();

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getInterimaire.request())
  }, [dispatch]);

  const { interimaire } = useSelector(
    state => ({
      interimaire: state.interimairesReducerData.interimaire
    }),
    shallowEqual
  )

  const logoutClick = () => {
    const toggle = document.getElementById('kt_quick_user_toggle')
    if (toggle) {
      toggle.click()
    }
    persistor.purge();
    window.location.replace(`${process.env.REACT_APP_URL}auth/int-login`);
    //history.push('/int-logout');
  }

  const closeMenu = () => {
    const close = document.getElementById('kt_quick_user_close')
    close.click()
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
            {!isNullOrEmpty(interimaire) && !isNullOrEmpty(interimaire.applicantPicture) ? (
              <Avatar
                className="symbol-label"
                color="#3699FF"
                src={"data:image/" + interimaire.applicantPicture.filename.split(".")[1] + ";base64," + interimaire.applicantPicture.base64}
              />
            ) :
              <Avatar
                className="symbol-label"
                color="#3699FF"
                maxInitials={2}
                name={
                  interimaire &&
                  interimaire.firstname &&
                  interimaire.firstname.concat(" ", interimaire.lastname)
                }
              />
            }
          </div>
          <div className='d-flex flex-column'>
            {interimaire &&
              (<a
                href='#'
                className='font-weight-bold font-size-h5 text-dark-75 text-hover-primary'
              >
                {interimaire && interimaire.firstname && interimaire.firstname.concat(' ', interimaire.lastname)}
              </a>)}
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
                    {interimaire && interimaire.email}
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
                    {interimaire && interimaire.mobilePhoneNumber && interimaire.mobilePhoneNumber.replace(/(.{2})(?!$)/g, "$1 ")}
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

        </div>
        {/*interimaire && interimaire.hasIDCard && interimaire.hasMatching &&
          (<div className='navi navi-spacer-x-0 p-0'>
            <Link className="navi-item" to="/int-profile-edit/step-two" onClick={closeMenu}>
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
          </div>)
                        */}
      {interimaire && interimaire.email &&
          (<div className='navi navi-spacer-x-0 p-0'>
            <Link className="navi-item" to="/int-profile-edit/step-two" onClick={closeMenu}>
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
          </div>)
        }
      </div>
    </div>
  )
}

export default injectIntl(QuickUserInterimaire)
