import React from "react";
import { Col, Row } from "react-bootstrap";
import { useSelector } from "react-redux";
import { Fade } from "react-reveal";
import SVG from "react-inlinesvg";
import { toAbsoluteUrl } from "../../../../../../_metronic/_helpers";
import "./styles.scss";
import { Link } from "react-router-dom";
import CountUp from "react-countup";

function AnnoncesMenu(props) {
  const interimairesReducerData = useSelector(
    state => state.interimairesReducerData
  );
  const { animationDuration, rightMenu } = interimairesReducerData;
  return (
    <div>
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
      <Fade duration={animationDuration} bottom cascade animate={false}>
        <div className="responsive_margin_bottom">
          {rightMenu.map((item, i) => (
            <div
              key={i}
              className="menu_item_container p-2"
              style={{ boxShadow: `-2px 2px 10px ${item.color}` }}
            >
              <Link to={item.urlLink}>
                <Row>
                  <Col xl={2} lg={3} md={2} sm={2} xs={3}>
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
                  <Col xl={8} lg={7} md={8} sm={8} xs={7} className="pt-4">
                    <h3 style={{ color: "#3F4254" }}>{item.title}</h3>
                    <div style={{ color: "#3F4254" }}>{item.description}</div>
                  </Col>
                  <Col xl={2} lg={2} md={2} sm={2} xs={2}>
                    <div
                      className="menu_item_score"
                      style={{ color: item.color }}
                    >
                      <CountUp end={item.value} duration={3} />
                    </div>
                  </Col>
                </Row>
              </Link>
            </div>
          ))}
        </div>
      </Fade>
    </div>
  );
}

export default AnnoncesMenu;
