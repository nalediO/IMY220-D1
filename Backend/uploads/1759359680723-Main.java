import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {

    // Enum to represent contention levels with associated think and work times
    enum Contention {
        LOW(100, 100),      // Low contention: longer think time, minimal work inside lock
        MEDIUM(10, 1000),   // Medium contention
        HIGH(1, 10000);     // High contention: minimal think time, heavy work in critical section

        final int thinkMs;       // Delay outside the lock (simulates doing other work)
        final int csWorkIters;   // Iterations inside lock (simulates critical section work)

        Contention(int thinkMs, int csWorkIters) {
            this.thinkMs = thinkMs;
            this.csWorkIters = csWorkIters;
        }
    }

    public static void main(String[] args) throws Exception {
        final int totalCoins = 2000;                  // Total coins in chest
        final int[] playerCounts = {2, 8, 16};        // Different numbers of players to test
        final int trials = 5;                          // Run multiple trials for reliability
        final String[] locks = {"TTAS", "CLH"};       // Lock types

        // Headers for CSV data (easy to import into spreadsheets)
        System.out.println("lock,contention,players,trial,exec_time_ms,backoffs,fairness_index");
        System.out.println("player_data_lock,player_data_contention,player_data_players,player_data_trial,player_data_player_index,player_data_coins");

        // Run experiments for each lock, contention, player count, and trial
        for (String lockName : locks) {
            for (Contention contention : Contention.values()) {
                for (int players : playerCounts) {
                    for (int trial = 1; trial <= trials; trial++) {
                        runExperiment(lockName, totalCoins, players, contention, trial);
                    }
                }
            }
        }
    }

    /**
     * Runs one experiment and prints summary and per-player results.
     */
    private static void runExperiment(String lockName, int totalCoins, int numPlayers,
                                      Contention contention, int trial) throws InterruptedException {

        // Choose the lock type
        Lock lock = "TTAS".equals(lockName) ? new TTASLock() : new CLHLock();
        TTASLock ttasLock = lock instanceof TTASLock ? (TTASLock) lock : null;

        // Create a single treasure chest for all players to compete for
        TreasureChest chest = new TreasureChest("Chest-1", totalCoins, lock);

        // Prepare players and their threads
        List<Player> players = new ArrayList<>(numPlayers);
        List<Thread> threads = new ArrayList<>(numPlayers);
        for (int i = 0; i < numPlayers; i++) {
            Player p = new Player("P" + i, Collections.singletonList(chest),
                                  contention.thinkMs, contention.csWorkIters);
            players.add(p);
            threads.add(new Thread(p));
        }

        // Start timing
        long start = System.nanoTime();

        // Start and wait for all player threads
        for (Thread t : threads) t.start();
        for (Thread t : threads) t.join();

        // End timing
        long end = System.nanoTime();
        long elapsedMs = (end - start) / 1_000_000;

        // Calculate fairness index
        double fairness = calculateFairnessIndex(players);

        // Get TTAS backoff count (0 for CLH)
        int backoffCount = ttasLock != null ? ttasLock.getBackoffCount() : 0;

        // Print the summary result for this trial
        System.out.printf("%s,%s,%d,%d,%d,%d,%.4f%n",
                lockName,
                contention.name(),
                numPlayers,
                trial,
                elapsedMs,
                backoffCount,
                fairness);

        // Print per-player results
        for (int i = 0; i < players.size(); i++) {
            System.out.printf("player_data_%s,player_data_%s,player_data_%d,player_data_%d,player_data_%d,player_data_%d%n",
                    lockName,
                    contention.name(),
                    numPlayers,
                    trial,
                    i,
                    players.get(i).getTotalCoins());
        }
    }

    /**
     * Calculate Jain's fairness index for a set of players.
     * Formula: (Σxᵢ)² / (n * Σxᵢ²) — closer to 1 = fairer.
     */
    private static double calculateFairnessIndex(List<Player> players) {
        double sum = 0, sumSquares = 0;
        for (Player p : players) {
            double coins = p.getTotalCoins();
            sum += coins;
            sumSquares += coins * coins;
        }
        int n = players.size();
        return sumSquares == 0 ? 0 : (sum * sum) / (n * sumSquares);
    }
}
