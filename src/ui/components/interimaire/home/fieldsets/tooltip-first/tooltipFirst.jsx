import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { goToNextStep } from "../../../../../../business/actions/interimaire/interimairesActions";
import "./styles.scss";
import WelcomeGif from "./welcome.gif";

function TooltipFirst(props) {
  const dispatch = useDispatch();
  const { interimaire, step } = useSelector(
    state => state.interimairesReducerData
  );
  return (
    <div
      className="popover show bs-popover-right information_tootip"
      onClick={() => goToNextStep(interimaire, step, dispatch)}
    >
      <div className="arrow" />
      <h3 className="popover-header information_tootip_width">Bienvenue</h3>
      <div
        className="popover-body information_tootip_width"
        style={{
          backgroundColor: "white",
          borderRadius: "0px 0px 5px 5px",
          display: "flex"
        }}
      >
        <div className="gif-wrapper">
          <img
            src={"/media/elements/welcome.gif"}
            alt=""
            className="align-self-end h-100px static-gif"
          />
          <img
            src={`/media/elements/welcome-loop.gif`}
            alt=""
            className="align-self-end h-100px"
          />
        </div>
        <div className="m-2">
          <div>Bienvenue dans votre espace intérimaire MyConnectt.</div>
          <div>
            Des milliers d'offres vous attendent sur notre plateforme et notre
            équipe mettra tout en oeuvre pour vous trouver la mission qui vous
            correspond le plus rapidement possible.
          </div>
          <div>
            Pour cela, commencez par compléter votre profil dans cette zone pour
            pouvoir postuler à nos offres.
          </div>
        </div>
      </div>
    </div>
  );
}

export default TooltipFirst;
