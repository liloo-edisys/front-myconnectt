import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { goToNextStep } from "../../../../../../business/actions/interimaire/InterimairesActions";

function TooltipSecond(props) {
  const dispatch = useDispatch();
  const { interimaire, step, rightMenu } = useSelector(
    state => state.interimairesReducerData
  );
  return (
    <div
      className="popover show bs-popover-left information_tootip_2"
      onClick={() => goToNextStep(interimaire, step, dispatch)}
    >
      <div className="arrow" />
      <h3
        className="popover-header"
        style={{ width: 600, position: "absolute", left: -324, top: -42 }}
      >
        Matching
      </h3>
      <div
        className="popover-body"
        style={{
          width: 600,
          position: "absolute",
          left: -324,
          backgroundColor: "white",
          borderRadius: "0px 0px 5px 5px",
          display: "flex"
        }}
      >
        <div className="gif-wrapper">
          <img
            src={"/media/elements/home-matching.gif"}
            alt=""
            className="align-self-end h-100px static-gif"
          />
          <img
            src={`/media/elements/home-matching-loop.gif`}
            alt=""
            className="align-self-end h-100px"
          />
        </div>
        {rightMenu && rightMenu[0].value === 0 ? (
          <div className="m-2">
            <div>
              Pour le moment, aucune mission ne correspond à votre profil mais
              de nouvelles missions arrivent tous les jours !
            </div>
            <div>
              N'hésitez pas à mettre à jour vos expériences, ajuster vos
              préférences de Matching et revenir régulièrement pour trouver des
              offres adaptées !
            </div>
            <div>
              Ps : Vous pouvez aussi rechercher par vous-même des offres dans
              "Mes recherches"
            </div>
          </div>
        ) : (
          <div className="m-2">
            <div>Plusieurs offres correspondent à votre profil.</div>
            <div>Continuez à compléter votre profil pour pouvoir postuler.</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TooltipSecond;
