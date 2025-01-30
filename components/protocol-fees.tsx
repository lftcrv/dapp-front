"use client";

import { useWallet } from "@/app/context/wallet-context";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import {
  Timer,
  TrendingUp,
  DollarSign,
  Rocket,
  Info,
  Brain,
  HelpCircle,
  ChevronRight,
  Flame,
  Trophy,
  Crown,
} from "lucide-react";
import { useProtocolFees } from "@/hooks/use-protocol-fees";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { memo, useMemo } from "react";
import { ProtocolFeesData } from "@/lib/types";

interface TooltipHelpProps {
  content: string;
}

const TooltipHelp = memo(({ content }: TooltipHelpProps) => (
  <Tooltip>
    <TooltipTrigger>
      <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
    </TooltipTrigger>
    <TooltipContent>
      <p className="w-[200px] text-sm">{content}</p>
    </TooltipContent>
  </Tooltip>
));
TooltipHelp.displayName = "TooltipHelp";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

const StatCard = memo(({ icon, label, value }: StatCardProps) => (
  <Card className="p-2 border border-primary/20 bg-background/50 hover:bg-background transition-colors">
    <div className="flex items-center gap-1 mb-1">
      {icon}
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
    <div className="text-base font-bold">{value}</div>
  </Card>
));
StatCard.displayName = "StatCard";

interface NextDistributionProps {
  timeLeft: string;
  userShare: string;
  address?: string;
}

const NextDistribution = memo(
  ({ timeLeft, userShare, address }: NextDistributionProps) => (
    <div className="bg-background/50 rounded-lg p-3 border border-primary/20">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-primary" />
          <span className="font-medium">Next Distribution</span>
        </div>
        <div className="text-2xl font-mono font-bold text-primary tracking-widest animate-glow">
          {address ? timeLeft : "-"}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <TrendingUp className="h-3 w-3 text-primary" />
        <span className="text-sm">
          Your Share: {address ? userShare : "-"} $LEFT
        </span>
      </div>
    </div>
  ),
);
NextDistribution.displayName = "NextDistribution";

interface DistributionInfoProps {
  feesData: ProtocolFeesData | null;
  userSharePercentage: string;
}

const DistributionInfo = memo(
  ({ feesData, userSharePercentage }: DistributionInfoProps) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" />
          <span className="text-sm">Your Position</span>
        </div>
        <span className="font-bold">Top {userSharePercentage}%</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-primary" />
          <span className="text-sm">Period Fees</span>
        </div>
        <span className="font-bold">{feesData?.periodFees || "-"} $LEFT</span>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Distribution Tiers</span>
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">LeftCurve</span>
            <span>{feesData?.distribution.leftCurve.percentage || "-"}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">RightCurve</span>
            <span>{feesData?.distribution.rightCurve.percentage || "-"}%</span>
          </div>
        </div>
      </div>
    </div>
  ),
);
DistributionInfo.displayName = "DistributionInfo";

interface ClaimButtonProps {
  address?: string;
  userShare: string;
  isClaiming: boolean;
  onClaim: () => void;
}

const ClaimButton = memo(
  ({ address, userShare, isClaiming, onClaim }: ClaimButtonProps) => (
    <Button
      className={cn(
        "w-full font-medium text-lg py-6 group relative overflow-hidden",
        !address || Number(userShare) === 0
          ? "opacity-50"
          : "animate-pulse hover:animate-none",
      )}
      disabled={!address || Number(userShare) === 0 || isClaiming}
      onClick={onClaim}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {!address ? (
          "Connect Wallet to Claim"
        ) : Number(userShare) === 0 ? (
          "No Rewards Available"
        ) : isClaiming ? (
          "Claiming..."
        ) : (
          <>
            Claim {userShare} $LEFT
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </span>
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 group-hover:opacity-100 opacity-0 transition-opacity" />
    </Button>
  ),
);
ClaimButton.displayName = "ClaimButton";

interface MainCardProps {
  address?: string;
  feesData: ProtocolFeesData | null;
  timeLeft: string;
  userShare: string;
  userSharePercentage: string;
  isClaiming: boolean;
  onClaim: () => void;
}

const MainCard = memo(
  ({
    address,
    feesData,
    timeLeft,
    userShare,
    userSharePercentage,
    isClaiming,
    onClaim,
  }: MainCardProps) => (
    <Card className="col-span-2 p-4 space-y-4 border-2 border-primary/20 hover:border-primary/40 transition-colors bg-gradient-to-br from-background to-background/50">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg tracking-tight">
              Protocol Fees
            </span>
          </div>
          <TooltipHelp content="Total protocol fees generated since launch. Distributed to $LEFT holders based on their curve position." />
        </div>
        <div className="text-3xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/50 bg-clip-text text-transparent">
          {feesData ? feesData.totalFees : "-"} $LEFT
        </div>
        {!address && (
          <div className="text-sm text-muted-foreground">
            Connect wallet to view your share of protocol fees
          </div>
        )}
      </div>

      <NextDistribution
        timeLeft={timeLeft}
        userShare={userShare}
        address={address}
      />

      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={<DollarSign className="h-4 w-4 text-primary" />}
          label="Period Fees"
          value={`${feesData ? feesData.periodFees : "-"} $LEFT`}
        />
        <StatCard
          icon={<Brain className="h-4 w-4 text-primary" />}
          label="Your Position"
          value={`Top ${address ? userSharePercentage : "-"}%`}
        />
        <StatCard
          icon={<Crown className="h-4 w-4 text-primary" />}
          label="Your Share"
          value={`${address ? userShare : "-"} $LEFT`}
        />
      </div>

      <ClaimButton
        address={address}
        userShare={userShare}
        isClaiming={isClaiming}
        onClaim={onClaim}
      />
    </Card>
  ),
);
MainCard.displayName = "MainCard";

interface DistributionCardProps {
  address?: string;
  feesData: ProtocolFeesData | null;
  userSharePercentage: string;
}

const DistributionCard = memo(
  ({ address, feesData, userSharePercentage }: DistributionCardProps) => (
    <Card className="p-6 space-y-4 border-2 border-primary/20 hover:border-primary/40 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-primary" />
          <span className="font-bold text-lg tracking-tight">Distribution</span>
        </div>
        <TooltipHelp content="Protocol fees are distributed based on your position in the curve. Higher positions receive a larger share." />
      </div>

      {address && feesData ? (
        <DistributionInfo
          feesData={feesData}
          userSharePercentage={userSharePercentage}
        />
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              <span className="text-sm">Your Position</span>
            </div>
            <span className="font-bold">-</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-sm">Period Fees</span>
            </div>
            <span className="font-bold">
              {feesData?.periodFees || "-"} $LEFT
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Distribution Tiers</span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">LeftCurve</span>
                <span>
                  {feesData?.distribution.leftCurve.percentage || "-"}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">RightCurve</span>
                <span>
                  {feesData?.distribution.rightCurve.percentage || "-"}%
                </span>
              </div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground text-center pt-2">
            Connect wallet to see your details
          </div>
        </div>
      )}
    </Card>
  ),
);
DistributionCard.displayName = "DistributionCard";

export function ProtocolFees() {
  const { currentAddress: address } = useWallet();
  const {
    feesData,
    timeLeft: distributionTimeLeft,
    isClaiming,
    claimRewards,
  } = useProtocolFees();

  const timeLeft = useMemo(() => {
    if (!feesData) return "--:--:--";
    return distributionTimeLeft;
  }, [feesData, distributionTimeLeft]);

  const userShare = useMemo(() => {
    if (!feesData || !address) return "0";
    return feesData.userShares[address] || "0";
  }, [feesData, address]);

  const userSharePercentage = useMemo(() => {
    if (!feesData || !address) return "0";
    const share = feesData.userShares[address];
    if (!share) return "0";
    const totalShares = Object.values(feesData.userShares).reduce(
      (a, b) => a + Number(b),
      0,
    );
    return totalShares > 0
      ? ((Number(share) / totalShares) * 100).toFixed(2)
      : "0";
  }, [feesData, address]);

  return (
    <TooltipProvider>
      <div className="grid grid-cols-3 gap-4">
        <MainCard
          address={address}
          feesData={feesData}
          timeLeft={timeLeft}
          userShare={userShare}
          userSharePercentage={userSharePercentage}
          isClaiming={isClaiming}
          onClaim={claimRewards}
        />
        <DistributionCard
          address={address}
          feesData={feesData}
          userSharePercentage={userSharePercentage}
        />
      </div>
    </TooltipProvider>
  );
}
ProtocolFees.displayName = "ProtocolFees";
