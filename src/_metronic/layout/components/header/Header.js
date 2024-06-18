import React, { useMemo } from "react";

import objectPath from "object-path";

import { AnimateLoading } from "../../../_partials/controls";
import { useHtmlClassService } from "../../_core/MetronicLayout";

import { HeaderMenuWrapper } from "./header-menu/HeaderMenuWrapper";
import { TopbarClient } from "./TopbarClient";
import { TopbarInterimaire } from "./TopbarInterimaire";
import { shallowEqual, useSelector } from "react-redux";

export function Header() {
  const uiService = useHtmlClassService();
  const { isInterimaire } = useSelector(
    ({ auth }) => ({
      isInterimaire: auth.user != null ? auth.user.userType === 0 : false,
    }),
    shallowEqual
  );

  const layoutProps = useMemo(() => {
    return {
      headerClasses: uiService.getClasses("header", true),
      headerAttributes: uiService.getAttributes("header"),
      headerContainerClasses: uiService.getClasses("header_container", true),
      menuHeaderDisplay: objectPath.get(
        uiService.config,
        "header.menu.self.display"
      )
    };
  }, [uiService]);

  return (
    <>
      {/*begin::Header*/}
      <div
        className={`header ${layoutProps.headerClasses}`}
        id="kt_header"
        style={{
          zIndex: 490
        }}
        {...layoutProps.headerAttributes}
      >
        {/*begin::Container*/}
        <div className={` ${layoutProps.headerContainerClasses} d-flex align-items-stretch justify-content-between`}>
          <AnimateLoading />
          {/*begin::Header Menu Wrapper*/}
          {layoutProps.menuHeaderDisplay && <HeaderMenuWrapper />}
          {!layoutProps.menuHeaderDisplay && <div />}
          {/*end::Header Menu Wrapper*/}

          {/*begin::Topbar*/}
          {isInterimaire ? <TopbarInterimaire /> : <TopbarClient />}
          {/*end::Topbar*/}
        </div>
        {/*end::Container*/}
      </div>
      {/*end::Header*/}
    </>
  );
}
