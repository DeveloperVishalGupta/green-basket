/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
    ],
  },
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
  allowedDevOrigins: ['iqra-fashions-prod-alb-46898589.ap-south-1.elb.amazonaws.com', 'https://iqrafashions.com/','https://www.iqrafashions.com/' ],
};

export default nextConfig;
