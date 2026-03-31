import React, { useMemo } from "react";

import { useHtmlClassService } from "../../../_core/MetronicLayout";
import { shallowEqual, useSelector } from "react-redux";

import AsideMenuListClient from "./AsideMenuListClient";
import AsideMenuListInterimaire from "./AsideMenuListInterimaire";

export function AsideMenu({ disableScroll }) {

  const { isInterimaire } = useSelector(
    ({ auth }) => ({
      isInterimaire: auth.user != null ? auth.user.userType === 0 : false,
    }),
    shallowEqual
  );

  const uiService = useHtmlClassService();
  const layoutProps = useMemo(() => {
    return {
      layoutConfig: uiService.config,
      asideMenuAttr: uiService.getAttributes("aside_menu"),
      ulClasses: uiService.getClasses("aside_menu_nav", true),
      asideClassesFromConfig: uiService.getClasses("aside_menu", true)
    };
  }, [uiService]);

  return (
    <>
      {/* begin::Menu Container */}
      <div
        id="kt_aside_menu"
        data-menu-vertical="1"
        className={`aside-menu my-4 ${layoutProps.asideClassesFromConfig}`}
        {...layoutProps.asideMenuAttr}
      >
        {isInterimaire ? <AsideMenuListInterimaire layoutProps={layoutProps} /> : <AsideMenuListClient layoutProps={layoutProps} />}

        <div
          className={`aside-fixed-bottom d-flex flex-column flex-md-row align-items-end justify-content-between`}
        >
          <div className="text-white order-2 order-md-1">

          </div>
        </div>
      </div>
      {/* end::Menu Container */}
    </>
  );
}
