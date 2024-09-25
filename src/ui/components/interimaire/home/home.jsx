import React, { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import Avatar from "react-avatar";
import "./home.scss";
import { Fade } from "react-reveal";
import { MixedWidgetProfile } from "../../../../_metronic/_partials/widgets";
import {
  ActivityDomain,
  AnnoncesList,
  AnnoncesMenu,
  AnnoncesMenuHover,
  EmailEdit,
  EmailTuto,
  Experiences,
  //ModalIdentity,
  TooltipFirst,
  TooltipSecond
} from "./fieldsets";
import { useDispatch, useSelector } from "react-redux";
import {
  getUserStartGuide,
  goToNextStep
} from "../../../../business/actions/interimaire/interimairesActions";

function Home(props) {
  const dispatch = useDispatch();
  //const { user } = useSelector(state => state.auth);
  const { interimaire, step, experiencesAdded } = useSelector(
    state => state.interimairesReducerData
  );
  const [windowWidth, setWindowWidth] = useState(null);

  useEffect(() => {
    if (interimaire) {
      getUserStartGuide(interimaire, dispatch);
    }
    setWindowWidth(window.innerWidth);
    if (windowWidth && windowWidth <= 768 && (step === 0 || step === 3)) {
      goToNextStep(interimaire, step, dispatch);
    }
  }, [interimaire, windowWidth, step]);

  return (
    <div className="home-background">
      {(step === 0 || step === 3) && (
        <div
          onClick={() => goToNextStep(interimaire, step, dispatch)}
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            height: "100%",
            margin: 0,
            width: "100%",
            zIndex: 10000,
            position: "absolute",
            top: 0,
            left: 0,
            overflowX: "hidden",
            overflowY: "hidden"
          }}
        />
      )}
      {/*<i className="fas fa-clipboard-list" style={{ fontSize: 30, marginRight: 20 }} />*/}
      <Row>
        <Col
          xl={
            interimaire &&
            interimaire.completedPercent &&
            interimaire.completedPercent < 50
              ? 5
              : 8
          }
          lg={
            interimaire &&
            interimaire.completedPercent &&
            interimaire.completedPercent < 50
              ? 6
              : 8
          }
        >
          {interimaire && (
            <div style={{ position: "relative" }}>
              {step === 0 && windowWidth && windowWidth > 768 ? (
                <EmailTuto />
              ) : step === 1 ? (
                <EmailEdit />
              ) : step === 2 ? (
                <ActivityDomain />
              ) : step === 3 && windowWidth && windowWidth > 768 ? (
                <Experiences />
              ) : step === 4 ? (
                <Experiences />
              ) : (
                step >= 5 && <AnnoncesList />
              )}
            </div>
          )}
        </Col>
        <Col
          xl={
            interimaire &&
            interimaire.completedPercent &&
            interimaire.completedPercent < 50
              ? 5
              : 4
          }
          lg={
            interimaire &&
            interimaire.completedPercent &&
            interimaire.completedPercent < 50
              ? 6
              : 4
          }
        >
          <div style={{ margin: 10 }}>
            {step === 0 && windowWidth && windowWidth > 768 && <TooltipFirst />}
            {step === 3 && windowWidth && windowWidth > 768 && (
              <TooltipSecond />
            )}
            {step === 3 && windowWidth && windowWidth > 768 ? (
              <AnnoncesMenuHover />
            ) : (
              <AnnoncesMenu />
            )}
          </div>
        </Col>
        {interimaire &&
          interimaire.completedPercent &&
          interimaire.completedPercent < 50 && (
            <Col xl={2} lg={12}>
              <Fade duration={1000} right cascade>
                <div className="right_profile_container">
                  <div style={{ display: "flex" }}>
                    <div className="right_profile_image">
                      <Avatar
                        className="symbol-label"
                        color="#3699FF"
                        maxInitials={2}
                        name={
                          interimaire &&
                          interimaire.firstname &&
                          interimaire.firstname.concat(
                            " ",
                            interimaire.lastname
                          )
                        }
                      />
                    </div>
                    {interimaire && (
                      <div className="right_profile_user">
                        <div className="right_profile_user_name">
                          {interimaire.firstname && interimaire.lastname
                            ? interimaire.firstname + " " + interimaire.lastname
                            : "-"}
                        </div>
                        <div>
                          {interimaire.mobilePhoneNumber &&
                            interimaire.mobilePhoneNumber.replace(
                              /(.{2})(?!$)/g,
                              "$1 "
                            )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="separator separator-solid-primary my-20 mx-30"></div>
                  {interimaire && (
                    <MixedWidgetProfile className="card-stretch gutter-b" />
                  )}
                </div>
              </Fade>
            </Col>
          )}
      </Row>
    </div>
  );
}

export default Home;
