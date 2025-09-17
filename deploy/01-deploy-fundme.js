module.exports= async ({getNamedAccounts,deployments})=>{
    const {firstAccount} = await getNamedAccounts()
    const {deploy} = await deployments

    await deploy("FundMe",{
        from: firstAccount,
        args: [180],
        log: true
    })
}

module.exports.tags=["all","fundme"]