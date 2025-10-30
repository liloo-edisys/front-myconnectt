import React from "react";
import SVG from "react-inlinesvg";
import { useHistory } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import { Zoom } from "react-reveal";
import { toAbsoluteUrl } from "../../../../../../_metronic/_helpers";
import "./styles.scss";

function ActivityDomain(props) {
  const history = useHistory();

  const handleRedirect = () => {
    history.push("/int-profile-edit/step-six");
  };

  return (
    <div style={{ margin: 10 }}>
      <div className="card card-custom title_container_radius">
        <div className="card-home border-top-auth ribbon ribbon-top ribbon-ver">
          <h2>
            <span className="svg-icon svg-icon-3x svg-icon-danger document_icon">
              <SVG
                className="h-75 align-self-end"
                src={toAbsoluteUrl("/media/svg/icons/General/Shield-check.svg")}
              ></SVG>
            </span>
            <span>
              <FormattedMessage id="BUTTON.INTERIMAIRE.COMPLETE" />
            </span>
          </h2>
        </div>
      </div>
      <Zoom duration={1000}>
        <div className="card card-custom card-stretch gutter-b mt-10 p-5">
          <div className="p-5 card card-custom bg-primary white font-weight-bolder">
            <div className=" flex-space-between">
              <div className="flex-space-between">
                <i className="flaticon-information icon-xxl mr-5 white" />
                <FormattedMessage id="TEXT.SEARCH.ACTIVITY" />
              </div>
              <div>
                <i className="flaticon2-cross icon-l white" />
              </div>
            </div>
          </div>
          <div className="p-10 text-center">
            <div className="mb-8">
              <h3 className="font-weight-bold text-dark-75 mb-5">
                Complétez votre profil professionnel
              </h3>
              <p className="text-muted font-size-lg">
                Pour optimiser vos opportunités d'emploi, veuillez renseigner
                vos informations sur vos postes précédents et vos compétences
                dans la section dédiée de votre profil.
              </p>
            </div>
            <div className="text-center">
              <button
                type="button"
                className="btn btn-primary font-weight-bold px-9 py-4 my-3 mx-4 btn-shadow"
                onClick={handleRedirect}
              >
                <span>Remplir mes informations professionnelles</span>
              </button>
            </div>
          </div>
        </div>
      </Zoom>
    </div>
  );
}

export default ActivityDomain;
