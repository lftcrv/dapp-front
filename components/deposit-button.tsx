"use client";

import { Button } from "@/components/ui/button";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount } from "wagmi";
import { DepositModal } from "./deposit-modal";
import { memo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DepositButton = memo(() => {
  const [showModal, setShowModal] = useState(false);
  const { authenticated } = usePrivy();
  const { address } = useAccount();

  const handleOpenModal = useCallback(() => {
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
  }, []);

  if (!authenticated || !address) {
    return null;
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Button
          onClick={handleOpenModal}
          variant="outline"
          className="
            bg-gradient-to-r from-yellow-500 to-pink-500 
            text-white hover:opacity-90 
            transition-all duration-200 
            hover:shadow-lg hover:shadow-yellow-500/20
          "
        >
          Deposit
        </Button>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <DepositModal
            isOpen={showModal}
            onClose={handleCloseModal}
            walletType="evm"
            address={address}
          />
        )}
      </AnimatePresence>
    </>
  );
});
DepositButton.displayName = "DepositButton";

export { DepositButton };
