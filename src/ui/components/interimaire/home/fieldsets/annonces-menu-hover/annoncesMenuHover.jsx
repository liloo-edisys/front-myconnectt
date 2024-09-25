import React from "react";
import { Col, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { Fade } from "react-reveal";
import SVG from "react-inlinesvg";
import { toAbsoluteUrl } from "../../../../../../_metronic/_helpers";
import { goToNextStep } from "../../../../../../business/actions/interimaire/interimairesActions";

function AnnoncesMenuHover(props) {
  const dispatch = useDispatch();
  const { interimaire, rightMenu, step } = useSelector(
    state => state.interimairesReducerData
  );

  return (
    <div onClick={() => goToNextStep(interimaire, step, dispatch)}>
      <div className="card card-custom title_container_radius">
        <div className="card-home border-top-auth ribbon ribbon-top ribbon-ver">
          <h2>
            <span className="svg-icon svg-icon-3x svg-icon-danger document_icon">
              <SVG
                className="h-75 align-self-end"
                src={toAbsoluteUrl("/media/svg/icons/Code/Settings4.svg")}
              ></SVG>
            </span>
            <span>MON MYCONNECTT</span>
          </h2>
        </div>
      </div>
      <Fade duration={1000} bottom cascade>
        <div style={{ marginTop: 130 }}>
          {rightMenu.map((item, i) => (
            <div
              key={i}
              className="menu_item_container"
              style={{
                boxShadow: `-5px 5px 5px ${item.color}`,
                zIndex: i === 0 && 10000,
                position: i === 0 && "absolute",
                width: i === 0 && "93%",
                top: 72
              }}
            >
              <Row>
                <Col lg={2}>
                  <div className="gif-wrapper">
                    <img
                      src={`/media/elements/${item.gif}.gif`}
                      alt=""
                      className="align-self-end h-70px static-gif"
                    />
                    <img
                      src={`/media/elements/${item.gif}-loop.gif`}
                      alt=""
                      className="align-self-end h-70px"
                    />
                  </div>
                </Col>
                <Col lg={8} className="pt-4">
                  <h3>{item.title}</h3>
                  <div>{item.description}</div>
                </Col>
                <Col lg={2}>
                  <div
                    className="menu_item_score"
                    style={{ color: item.color }}
                  >
                    {item.value}
                  </div>
                </Col>
              </Row>
            </div>
          ))}
        </div>
      </Fade>
    </div>
  );
}

export default AnnoncesMenuHover;
