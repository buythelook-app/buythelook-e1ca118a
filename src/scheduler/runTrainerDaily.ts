
import { runValidationCycle } from "../agents/trainerAgent";
import logger from "../lib/logger";

/**
 * Interval in milliseconds between validation runs
 * 1 hour = 60 * 60 * 1000 ms
 */
const VALIDATION_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Flag to track if the scheduler is already running
 */
let isSchedulerRunning = false;

/**
 * Starts the periodic validation cycle scheduler
 * Will run the validation cycle once per hour
 * @returns A function to stop the scheduler
 */
export const startValidationScheduler = (): (() => void) => {
  if (isSchedulerRunning) {
    logger.warn("Validation scheduler is already running", { context: "ValidationScheduler" });
    return () => {}; // Return a no-op function if scheduler is already running
  }

  logger.info("Starting hourly validation cycle scheduler", { context: "ValidationScheduler" });
  isSchedulerRunning = true;

  // Run once immediately
  runValidationCycle()
    .then(result => {
      if (result.success) {
        logger.info("Initial validation cycle completed successfully", {
          context: "ValidationScheduler",
          data: {
            userScores: result.data.userScores,
            summary: result.data.summary
          }
        });
      } else {
        logger.error("Initial validation cycle failed", {
          context: "ValidationScheduler",
          data: { error: result.error }
        });
      }
    })
    .catch(error => {
      logger.error("Error in initial validation cycle", {
        context: "ValidationScheduler",
        data: { error }
      });
    });

  // Schedule subsequent runs
  const intervalId = setInterval(() => {
    logger.info("Running scheduled validation cycle", { context: "ValidationScheduler" });
    
    runValidationCycle()
      .then(result => {
        if (result.success) {
          logger.info("Scheduled validation cycle completed", {
            context: "ValidationScheduler",
            data: {
              userScores: result.data.userScores,
              summary: result.data.summary
            }
          });
        } else {
          logger.error("Scheduled validation cycle failed", {
            context: "ValidationScheduler",
            data: { error: result.error }
          });
        }
      })
      .catch(error => {
        logger.error("Error in scheduled validation cycle", {
          context: "ValidationScheduler",
          data: { error }
        });
      });
  }, VALIDATION_INTERVAL_MS);

  // Return function to stop the scheduler
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
      isSchedulerRunning = false;
      logger.info("Validation scheduler stopped", { context: "ValidationScheduler" });
    }
  };
};

/**
 * Runs a single validation cycle on demand
 * Useful for manual triggering of the validation process
 * @returns A promise resolving to the validation cycle result
 */
export const runManualValidation = async () => {
  logger.info("Running manual validation cycle", { context: "ValidationScheduler" });
  
  try {
    const result = await runValidationCycle();
    if (result.success) {
      logger.info("Manual validation cycle completed successfully", {
        context: "ValidationScheduler",
        data: {
          userScores: result.data.userScores,
          summary: result.data.summary
        }
      });
    } else {
      logger.error("Manual validation cycle failed", {
        context: "ValidationScheduler",
        data: { error: result.error }
      });
    }
    return result;
  } catch (error) {
    logger.error("Error in manual validation cycle", {
      context: "ValidationScheduler",
      data: { error }
    });
    throw error;
  }
};
