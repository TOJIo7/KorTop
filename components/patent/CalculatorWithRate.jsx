import { getRateOrNull } from "@/lib/safeRate";
import PatentCalculator from "./PatentCalculator";
import RateNote from "./RateNote";

// Калькулятор с курсом сомони на сегодня; оборачивать в <Suspense>
export default async function CalculatorWithRate(props) {
  const rate = await getRateOrNull();

  return (
    <div className="flex flex-col gap-2">
      <PatentCalculator {...props} rate={rate?.rate ?? null} />
      <RateNote rate={rate} />
    </div>
  );
}
