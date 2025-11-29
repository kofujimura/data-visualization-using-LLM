// K-Means クラスタリングの実装
class KMeans {
    constructor(k, maxIterations = 100) {
        this.k = k;
        this.maxIterations = maxIterations;
        this.centroids = [];
        this.clusters = [];
    }

    fit(data) {
        const n = data.length;
        const dim = data[0].length;

        // 初期重心をランダムに選択（k-means++アルゴリズム）
        this.centroids = this.initializeCentroidsKMeansPlusPlus(data);

        for (let iter = 0; iter < this.maxIterations; iter++) {
            // 各データポイントを最も近い重心に割り当て
            const newClusters = new Array(n);
            for (let i = 0; i < n; i++) {
                newClusters[i] = this.findClosestCentroid(data[i]);
            }

            // 収束判定
            if (this.hasConverged(newClusters)) {
                break;
            }

            this.clusters = newClusters;

            // 重心を更新
            this.updateCentroids(data);
        }

        return this.clusters;
    }

    initializeCentroidsKMeansPlusPlus(data) {
        const centroids = [];
        const n = data.length;

        // 最初の重心をランダムに選択
        const firstIndex = Math.floor(Math.random() * n);
        centroids.push([...data[firstIndex]]);

        // 残りのk-1個の重心を選択
        for (let i = 1; i < this.k; i++) {
            const distances = data.map(point => {
                const minDist = Math.min(...centroids.map(c => this.euclideanDistance(point, c)));
                return minDist * minDist;
            });

            const sumDistances = distances.reduce((a, b) => a + b, 0);
            let random = Math.random() * sumDistances;

            for (let j = 0; j < n; j++) {
                random -= distances[j];
                if (random <= 0) {
                    centroids.push([...data[j]]);
                    break;
                }
            }
        }

        return centroids;
    }

    findClosestCentroid(point) {
        let minDist = Infinity;
        let closestIndex = 0;

        for (let i = 0; i < this.k; i++) {
            const dist = this.euclideanDistance(point, this.centroids[i]);
            if (dist < minDist) {
                minDist = dist;
                closestIndex = i;
            }
        }

        return closestIndex;
    }

    euclideanDistance(a, b) {
        let sum = 0;
        for (let i = 0; i < a.length; i++) {
            sum += (a[i] - b[i]) ** 2;
        }
        return Math.sqrt(sum);
    }

    hasConverged(newClusters) {
        if (this.clusters.length === 0) return false;

        for (let i = 0; i < newClusters.length; i++) {
            if (newClusters[i] !== this.clusters[i]) {
                return false;
            }
        }

        return true;
    }

    updateCentroids(data) {
        const dim = data[0].length;
        const newCentroids = Array(this.k).fill(null).map(() => Array(dim).fill(0));
        const counts = Array(this.k).fill(0);

        // 各クラスタの平均を計算
        for (let i = 0; i < data.length; i++) {
            const cluster = this.clusters[i];
            counts[cluster]++;
            for (let j = 0; j < dim; j++) {
                newCentroids[cluster][j] += data[i][j];
            }
        }

        // 平均で割る
        for (let i = 0; i < this.k; i++) {
            if (counts[i] > 0) {
                for (let j = 0; j < dim; j++) {
                    newCentroids[i][j] /= counts[i];
                }
            } else {
                // 空のクラスタの場合、ランダムなデータポイントを選択
                const randomIndex = Math.floor(Math.random() * data.length);
                newCentroids[i] = [...data[randomIndex]];
            }
        }

        this.centroids = newCentroids;
    }
}
