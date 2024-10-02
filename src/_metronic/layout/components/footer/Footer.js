import React, { useMemo } from "react";


import { FormattedMessage } from "react-intl";

import { useHtmlClassService } from "../../_core/MetronicLayout";
import "./styles.scss"

export function Footer() {
  const today = new Date().getFullYear();
  const uiService = useHtmlClassService();

  const layoutProps = useMemo(() => {
    return {
      footerClasses: uiService.getClasses("footer", true),
      footerContainerClasses: uiService.getClasses("footer_container", true)
    };
  }, [uiService]);

  return (
    <div
      className={`footer  bg-white py-4 d-flex flex-lg-column  ${layoutProps.footerClasses}`}
      style={{zIndex:10}}
      id="kt_footer"
    >
      <div
        className={`${layoutProps.footerContainerClasses} d-flex flex-column flex-md-row align-items-center justify-content-between`}
      >
        <div className="nav nav-dark order-1 order-md-2 regular_footer">
          <a href="https://myconnectt.fr/" target="blank" className="mr-10">
            <FormattedMessage id="TEXT.COPYRIGHT" />{" "}
            <span className="text font-weight-bold mr-2">{today.toString()}</span>&copy;
            </a>
          <a
            href="https://myconnectt.fr/mentions-legales/"
            target="blank"
            className="text font-weight-bold mr-10"
          >
            <FormattedMessage id="TEXT.LEGAL" />
          </a>
          <a
            href="https://myconnectt.fr/protection-des-donnees-personnelles/"
            target="blank"
            className="text font-weight-bold mr-10"
          >
            <FormattedMessage id="TEXT.PRIVACY" />
          </a>
          <a
            href="https://myconnectt.fr/contact"
            target="blank"
            className="text font-weight-bold mr-10"
          >
            <FormattedMessage id="TEXT.CONTACT" />
          </a>
        </div>
        <div className="nav nav-dark order-1 order-md-2 responsive_footer">
          <div className="responsive_footer_button_container" style={{marginBottom:5}}> 
          <a href="https://myconnectt.fr/" target="blank">
            <FormattedMessage id="TEXT.COPYRIGHT" />{" "}
            <span className="text font-weight-bold mr-2">{today.toString()}</span>&copy;
            </a>
          <a
            href="https://myconnectt.fr/mentions-legales/"
            target="blank"
            className="text font-weight-bold"
          >
            <FormattedMessage id="TEXT.LEGAL" />
          </a>
          </div>
          <div className="responsive_footer_button_container">
          <a
            href="https://myconnectt.fr/protection-des-donnees-personnelles/"
            target="blank"
            className="text font-weight-bold"
          >
            <FormattedMessage id="TEXT.PRIVACY" />
          </a>
          <a
            href="https://myconnectt.fr/contact"
            target="blank"
            className="text font-weight-bold"
          >
            <FormattedMessage id="TEXT.CONTACT" />
          </a>

          </div>
        </div>
      </div>
    </div>
  );
}