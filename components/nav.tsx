import { ConnectWallet } from "./connect-wallet";
import { DepositButton } from "./deposit-button";
import { memo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const Logo = memo(() => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3 }}
    className="flex items-center gap-2"
  >
    <Link
      href="/"
      className="text-xl font-bold hover:text-yellow-500 transition-colors"
    >
      LeftCurve
    </Link>
  </motion.div>
));
Logo.displayName = "Logo";

const Actions = memo(() => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3 }}
    className="flex items-center gap-4"
  >
    <DepositButton />
    <ConnectWallet />
  </motion.div>
));
Actions.displayName = "Actions";

const Nav = memo(() => {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="
        fixed top-0 left-0 right-0 z-50 
        flex items-center justify-between 
        px-4 py-3 
        bg-black/50 backdrop-blur-lg
        border-b border-white/5
      "
    >
      <Logo />
      <Actions />
    </motion.nav>
  );
});
Nav.displayName = "Nav";

export { Nav };
