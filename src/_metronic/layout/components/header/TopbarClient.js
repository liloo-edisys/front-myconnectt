import React from "react";

import { QuickUserToggler } from "../extras/QuiclUserToggler";

export function TopbarClient() {
  return (
    <div className="topbar toolbar-client-height">
      <QuickUserToggler />
    </div>
  );
}