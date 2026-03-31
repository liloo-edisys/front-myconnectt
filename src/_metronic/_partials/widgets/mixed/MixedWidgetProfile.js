/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid */
import React, { useMemo, useEffect, useState } from "react";
import objectPath from "object-path";
import ApexCharts from "apexcharts";
import { useHtmlClassService } from "../../../layout";
import { KTUtil } from "../../../_assets/js/components/util";
import { shallowEqual, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";

export function MixedWidgetProfile({ className }) {
  const { interimaireId } = useParams();
  const uiService = useHtmlClassService();
  const [percentWidgetIsLoaded, setPercentWidgetIsLoaded]=useState(false)
  const { applicant, step } = useSelector(
    state => ({
      applicant: state.interimairesReducerData.interimaire ?state.interimairesReducerData.interimaire: state.accountsReducerData.activeInterimaire ,
      step: state.interimairesReducerData.step
    }),
    shallowEqual
  );
  const layoutProps = useMemo(() => {
    return {
      colorsGrayGray100: objectPath.get(uiService.config, "js.colors.gray.gray100"),
      colorsGrayGray700: objectPath.get(uiService.config, "js.colors.gray.gray700"),
      colorsThemeBaseSuccess: objectPath.get(
        uiService.config,
        "js.colors.theme.base.success"
      ),
      colorsThemeLightSuccess: objectPath.get(
        uiService.config,
        "js.colors.theme.light.success"
      ),
      fontFamily: objectPath.get(uiService.config, "js.fontFamily")
    };
  }, [uiService]);

  useEffect(() => {
    if(!percentWidgetIsLoaded) {
    renderPercentItem()
    setPercentWidgetIsLoaded(true)
    }
    const element = document.getElementById("kt_mixed_widget_14_chart");
    if (!element) {
      return;
    }

    const height = parseInt(KTUtil.css(element, 'height'));
    const options = getChartOptions(layoutProps, height, applicant);

    const chart = new ApexCharts(element, options);
    chart.render();
    return function cleanUp() {
      chart.destroy();
    };
  }, [layoutProps, applicant, step, percentWidgetIsLoaded]);

  const renderPercentItem = () => {
    return (
        <div className="flex-grow-1 responsive_percent" >
          <div id="kt_mixed_widget_14_chart" style={{ height: "200px" }}></div>
        </div>
    )
  }

  return (
    <>
        {renderPercentItem()}
        {!interimaireId && 
        <>
        {applicant && applicant.completedPercent < 100 ? 
        <div className="pt-5">
          <p className="text-justify font-weight-normal font-size-lg pb-7">
            Votre profil est incomplet.<br />
          N’oubliez pas que vous ne pouvez pas postuler sur les offres de Myconnectt avant de mettre à jour vos informations.
          </p>
        </div> : <div className="pt-5">
          <p className="text-justify font-weight-normal font-size-lg pb-7">
            Votre profil est complet.<br />
          Vous pouvez désormais postuler sur les offres MyConnectt.
          </p>
          <p className="text-justify font-weight-normal font-size-lg pb-7">
            Cliquer sur ce bouton pour voir les offres qui peuvent vous intéresser.
          </p>
          <Link to="/matching" className="btn btn-primary btn-shadow font-weight-bolder w-100 py-3">Matching</Link>
        </div>}
        </>}
    </>
  );
}

function getChartOptions(layoutProps, height, applicant) {
  const options = {
    series: [applicant && applicant.completedPercent ? applicant.completedPercent : 0],
    chart: {
      height: height,
      type: 'radialBar',
    },
    plotOptions: {
      radialBar: {
        hollow: {
          margin: 0,
          size: "65%"
        },
        dataLabels: {
          showOn: "always",
          name: {
            show: false,
            fontWeight: "700",
          },
          value: {
            color: layoutProps.colorsGrayGray700,
            fontSize: "30px",
            fontWeight: "700",
            offsetY: 12,
            show: true
          },
        },
        track: {
          background: layoutProps.colorsThemeLightSuccess,
          strokeWidth: '100%'
        }
      }
    },
    colors: [layoutProps.colorsThemeBaseSuccess],
    stroke: {
      lineCap: "round",
    },
    labels: ["Progress"]
  };
  return options;
}
