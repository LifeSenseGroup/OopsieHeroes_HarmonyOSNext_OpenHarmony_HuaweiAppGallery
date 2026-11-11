import localUnitTest from './LocalUnit.test';
import predictionEngineTest from './PredictionEngine.test';

export default function testsuite() {
  localUnitTest();
  predictionEngineTest();
}